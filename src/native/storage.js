// Unified Native Storage Adapter with graceful fallback

let AsyncStorageModule = null;
try {
  AsyncStorageModule = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorageModule = null;
}

const memoryStore = new Map();

function getWebStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // Ignore restricted environments
  }
  return null;
}

export const Storage = {
  async getItem(key) {
    try {
      const webStorage = getWebStorage();
      if (webStorage) {
        const val = webStorage.getItem(key);
        if (val !== null) return val;
      }
      if (AsyncStorageModule) {
        const val = await AsyncStorageModule.getItem(key);
        if (val !== null) return val;
      }
      return memoryStore.has(key) ? memoryStore.get(key) : null;
    } catch (err) {
      console.warn('Storage getItem error for key:', key, err);
      return memoryStore.has(key) ? memoryStore.get(key) : null;
    }
  },

  async setItem(key, value) {
    try {
      const webStorage = getWebStorage();
      if (webStorage) {
        webStorage.setItem(key, value);
      }
      if (AsyncStorageModule) {
        await AsyncStorageModule.setItem(key, value);
      }
      memoryStore.set(key, value);
    } catch (err) {
      console.warn('Storage setItem error for key:', key, err);
      memoryStore.set(key, value);
    }
  },

  async removeItem(key) {
    try {
      const webStorage = getWebStorage();
      if (webStorage) {
        webStorage.removeItem(key);
      }
      if (AsyncStorageModule) {
        await AsyncStorageModule.removeItem(key);
      }
      memoryStore.delete(key);
    } catch (err) {
      console.warn('Storage removeItem error for key:', key, err);
      memoryStore.delete(key);
    }
  },

  async getJSON(key, defaultValue = null) {
    try {
      const data = await this.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  async setJSON(key, value) {
    try {
      await this.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Storage setJSON error:', err);
    }
  }
};

// Storage keys
export const getEntriesKey = (userId) => `milk_tracker_${userId}_entries`;
export const getSettingsKey = (userId) => `milk_tracker_${userId}_settings`;
export const getRatesKey = (userId) => `milk_tracker_${userId}_rates`;
export const getStatusKey = (userId) => `milk_tracker_${userId}_status`;
export const USERS_KEY = 'milk_tracker_users';
export const SESSION_KEY = 'milk_tracker_session';

export const DEFAULT_SETTINGS = {
  supplierName: 'Supplier',
  defaultRate: 60,
  currency: 'PKR',
  defaultQuantity: 1.0,
  quickQuantities: [0.5, 1.0, 1.5, 2.0]
};
