import supabase from '../supabaseClient';
import {
  Storage,
  getEntriesKey,
  getSettingsKey,
  getRatesKey,
  getStatusKey,
  DEFAULT_SETTINGS
} from '../native/storage';

const PENDING_SYNC_KEY = (userId) => `milk_tracker_${userId}_pending_sync`;

/**
 * Offline-First Data Service
 * 
 * - Instant reads & writes using local cache (zero lag)
 * - Transparent background synchronization with Supabase
 * - Safe offline fallbacks (never crash if network fails or tables are initializing)
 * - Multi-user row-level security isolation (user_id = auth.uid())
 */
export const dataService = {
  // ==========================================
  // ENTRIES
  // ==========================================

  async getEntries(userId) {
    // 1. Return cached entries immediately for instant load
    const localEntries = (await Storage.getJSON(getEntriesKey(userId), [])) || [];

    // 2. Fetch fresh entries from Supabase in background
    try {
      if (!supabase) return localEntries;

      const { data, error } = await supabase
        .from('milk_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.warn('Supabase getEntries error:', error.message);
        return localEntries;
      }

      if (data && Array.isArray(data)) {
        const cloudEntries = data.map(item => ({
          id: item.id,
          date: item.date,
          quantity: Number(item.quantity),
          shift: item.shift,
          note: item.note || '',
          createdAt: item.created_at
        }));

        // Update local cache with cloud data
        await Storage.setJSON(getEntriesKey(userId), cloudEntries);
        return cloudEntries;
      }
    } catch (err) {
      console.warn('Network / sync error fetching entries:', err);
    }

    return localEntries;
  },

  async addOrUpdateEntry(userId, entry) {
    // 1. Update local cache immediately
    const localEntries = (await Storage.getJSON(getEntriesKey(userId), [])) || [];
    const index = localEntries.findIndex(e => e.id === entry.id);
    let updated;
    if (index >= 0) {
      updated = [...localEntries];
      updated[index] = { ...updated[index], ...entry };
    } else {
      updated = [entry, ...localEntries];
    }
    await Storage.setJSON(getEntriesKey(userId), updated);

    // 2. Sync to Supabase in background
    try {
      if (supabase) {
        const { error } = await supabase
          .from('milk_entries')
          .upsert({
            id: entry.id,
            user_id: userId,
            date: entry.date,
            quantity: Number(entry.quantity),
            shift: entry.shift || 'Morning',
            note: entry.note || '',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (error) {
          console.warn('Supabase entry upsert warning:', error.message);
          await this.queuePending(userId, { type: 'upsert_entry', payload: entry });
        }
      }
    } catch (err) {
      console.warn('Offline: entry queued for sync', err);
      await this.queuePending(userId, { type: 'upsert_entry', payload: entry });
    }

    return updated;
  },

  async deleteEntry(userId, entryId) {
    // 1. Update local cache immediately
    const localEntries = (await Storage.getJSON(getEntriesKey(userId), [])) || [];
    const updated = localEntries.filter(e => e.id !== entryId);
    await Storage.setJSON(getEntriesKey(userId), updated);

    // 2. Delete from Supabase
    try {
      if (supabase) {
        const { error } = await supabase
          .from('milk_entries')
          .delete()
          .eq('id', entryId)
          .eq('user_id', userId);

        if (error) {
          console.warn('Supabase entry delete warning:', error.message);
          await this.queuePending(userId, { type: 'delete_entry', payload: { id: entryId } });
        }
      }
    } catch (err) {
      console.warn('Offline: delete queued for sync', err);
      await this.queuePending(userId, { type: 'delete_entry', payload: { id: entryId } });
    }

    return updated;
  },

  // ==========================================
  // SETTINGS
  // ==========================================

  async getSettings(userId) {
    const local = (await Storage.getJSON(getSettingsKey(userId), DEFAULT_SETTINGS)) || DEFAULT_SETTINGS;

    try {
      if (!supabase) return local;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Supabase getSettings error:', error.message);
        return local;
      }

      if (data) {
        const cloudSettings = {
          supplierName: data.supplier_name || local.supplierName,
          defaultRate: data.default_rate !== null ? Number(data.default_rate) : local.defaultRate,
          currency: data.currency || local.currency,
          defaultQuantity: data.default_quantity !== null ? Number(data.default_quantity) : local.defaultQuantity,
          quickQuantities: Array.isArray(data.quick_quantities) ? data.quick_quantities : local.quickQuantities
        };
        await Storage.setJSON(getSettingsKey(userId), cloudSettings);
        return cloudSettings;
      }
    } catch (err) {
      console.warn('Network / sync error fetching settings:', err);
    }

    return local;
  },

  async saveSettings(userId, newSettings) {
    await Storage.setJSON(getSettingsKey(userId), newSettings);

    try {
      if (supabase) {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            supplier_name: newSettings.supplierName,
            default_rate: Number(newSettings.defaultRate),
            currency: newSettings.currency,
            default_quantity: Number(newSettings.defaultQuantity),
            quick_quantities: newSettings.quickQuantities,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    } catch (err) {
      console.warn('Offline: settings save warning:', err);
    }
  },

  // ==========================================
  // MONTHLY SUMMARIES (Rates & Paid Status)
  // ==========================================

  async getMonthlyData(userId) {
    const localRates = (await Storage.getJSON(getRatesKey(userId), {})) || {};
    const localStatus = (await Storage.getJSON(getStatusKey(userId), {})) || {};

    try {
      if (!supabase) return { rates: localRates, status: localStatus };

      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('Supabase getMonthlyData error:', error.message);
        return { rates: localRates, status: localStatus };
      }

      if (data && Array.isArray(data)) {
        const cloudRates = { ...localRates };
        const cloudStatus = { ...localStatus };

        data.forEach(item => {
          if (item.rate !== null && item.rate !== undefined) {
            cloudRates[item.month] = Number(item.rate);
          }
          if (item.is_paid !== null && item.is_paid !== undefined) {
            cloudStatus[item.month] = Boolean(item.is_paid);
          }
        });

        await Storage.setJSON(getRatesKey(userId), cloudRates);
        await Storage.setJSON(getStatusKey(userId), cloudStatus);

        return { rates: cloudRates, status: cloudStatus };
      }
    } catch (err) {
      console.warn('Network error fetching monthly summaries:', err);
    }

    return { rates: localRates, status: localStatus };
  },

  async saveMonthlyRate(userId, month, rate, currentStatus = false) {
    const localRates = (await Storage.getJSON(getRatesKey(userId), {})) || {};
    localRates[month] = rate;
    await Storage.setJSON(getRatesKey(userId), localRates);

    try {
      if (supabase) {
        await supabase
          .from('monthly_summaries')
          .upsert({
            id: `${userId}_${month}`,
            user_id: userId,
            month,
            rate: Number(rate),
            is_paid: Boolean(currentStatus),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,month' });
      }
    } catch (err) {
      console.warn('Offline: save rate warning:', err);
    }
  },

  async saveMonthlyStatus(userId, month, isPaid, currentRate = null) {
    const localStatus = (await Storage.getJSON(getStatusKey(userId), {})) || {};
    localStatus[month] = isPaid;
    await Storage.setJSON(getStatusKey(userId), localStatus);

    try {
      if (supabase) {
        await supabase
          .from('monthly_summaries')
          .upsert({
            id: `${userId}_${month}`,
            user_id: userId,
            month,
            rate: currentRate !== null ? Number(currentRate) : null,
            is_paid: Boolean(isPaid),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,month' });
      }
    } catch (err) {
      console.warn('Offline: save status warning:', err);
    }
  },

  async resetUserData(userId) {
    await Storage.removeItem(getEntriesKey(userId));
    await Storage.removeItem(getRatesKey(userId));
    await Storage.removeItem(getStatusKey(userId));

    try {
      if (supabase) {
        await supabase.from('milk_entries').delete().eq('user_id', userId);
        await supabase.from('monthly_summaries').delete().eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Supabase reset error:', err);
    }
  },

  // ==========================================
  // SYNC QUEUE HELPER
  // ==========================================
  async queuePending(userId, action) {
    try {
      const queue = (await Storage.getJSON(PENDING_SYNC_KEY(userId), [])) || [];
      queue.push({ ...action, timestamp: Date.now() });
      await Storage.setJSON(PENDING_SYNC_KEY(userId), queue);
    } catch (e) {
      // Ignore
    }
  },

  async syncPendingQueue(userId) {
    try {
      if (!supabase) return;
      const queue = (await Storage.getJSON(PENDING_SYNC_KEY(userId), [])) || [];
      if (queue.length === 0) return;

      const remaining = [];
      for (const item of queue) {
        try {
          if (item.type === 'upsert_entry') {
            await supabase.from('milk_entries').upsert({
              id: item.payload.id,
              user_id: userId,
              date: item.payload.date,
              quantity: Number(item.payload.quantity),
              shift: item.payload.shift,
              note: item.payload.note || '',
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          } else if (item.type === 'delete_entry') {
            await supabase.from('milk_entries').delete().eq('id', item.payload.id).eq('user_id', userId);
          }
        } catch (err) {
          remaining.push(item);
        }
      }
      await Storage.setJSON(PENDING_SYNC_KEY(userId), remaining);
    } catch (e) {
      console.warn('Error syncing pending queue:', e);
    }
  }
};

export default dataService;
