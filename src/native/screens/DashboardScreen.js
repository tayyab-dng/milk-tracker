import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Share,
  Alert
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

export default function DashboardScreen({
  entries,
  settings,
  monthlyRates,
  updateMonthlyRate,
  monthlyStatus,
  toggleMonthlyStatus,
  currentMonth,
  setCurrentMonth,
  setCurrentTab,
  showToast
}) {
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState('');

  // Format month name (e.g. 2026-06 -> June 2026)
  const getMonthLabel = (monthStr) => {
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  const changeMonth = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + direction;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    const formatted = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setCurrentMonth(formatted);
  };

  // Filter entries for current month
  const filteredEntries = entries.filter(e => e.date && e.date.startsWith(currentMonth));
  const totalKg = filteredEntries.reduce((acc, entry) => acc + (parseFloat(entry.quantity) || 0), 0);
  const rate = monthlyRates[currentMonth] !== undefined ? monthlyRates[currentMonth] : (settings.defaultRate || 60);
  const totalBill = totalKg * rate;
  const isPaid = monthlyStatus[currentMonth] || false;

  const [yearNum, monNum] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monNum, 0).getDate();
  const daysLogged = new Set(filteredEntries.map(e => e.date)).size;
  const avgDaily = daysLogged > 0 ? (totalKg / daysLogged).toFixed(1) : '0.0';

  const handleRateSubmit = () => {
    const r = parseFloat(tempRate);
    if (!isNaN(r) && r >= 0) {
      updateMonthlyRate(currentMonth, r);
      setIsEditingRate(false);
      showToast(`Rate updated to ${settings.currency}${r}/kg`);
    } else {
      Alert.alert('Invalid Rate', 'Please enter a valid numeric rate.');
    }
  };

  const handleShareReport = async () => {
    const monthLabel = getMonthLabel(currentMonth);
    const supplier = settings.supplierName || 'Supplier';
    const message = 
      `🥛 Milk Delivery Report - ${monthLabel}\n` +
      `──────────────────────────\n` +
      `👤 Supplier: ${supplier}\n` +
      `📦 Total Milk: ${totalKg.toFixed(2)} kg/L\n` +
      `💵 Rate: ${settings.currency}${rate}/kg\n` +
      `💰 Total Bill: ${settings.currency}${totalBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `📌 Status: ${isPaid ? '✅ PAID' : '⏳ UNPAID'}\n` +
      `──────────────────────────\n` +
      `Generated via Milk Tracker`;

    try {
      await Share.share({ message });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  const recentEntries = [...filteredEntries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Milk Tracker 🥛</Text>
          <Text style={styles.subtitle}>
            Supplier: <Text style={styles.supplierHighlight}>{settings.supplierName || 'Supplier'}</Text>
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.shareBtn}
          onPress={handleShareReport}
        >
          <Text style={styles.shareBtnText}>Share 📤</Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigator */}
      <View style={styles.monthSelector}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.monthArrow}
          onPress={() => changeMonth(-1)}
        >
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>
        <View style={styles.monthLabelContainer}>
          <Text style={styles.monthText}>{getMonthLabel(currentMonth)}</Text>
          <Text style={styles.monthSubtext}>{daysLogged} of {daysInMonth} days logged</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.monthArrow}
          onPress={() => changeMonth(1)}
        >
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Main Bill Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroLabel}>TOTAL BILL</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusUnpaid]}
            onPress={() => toggleMonthlyStatus(currentMonth)}
          >
            <Text style={[styles.statusText, isPaid ? styles.statusPaidText : styles.statusUnpaidText]}>
              {isPaid ? '✓ PAID' : '⏳ UNPAID'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroAmount}>
          {settings.currency}{totalBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={styles.heroSubtext}>
          Tap badge to mark as {isPaid ? 'Unpaid' : 'Paid'}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Total Quantity */}
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statLabel}>Total Delivered</Text>
          <Text style={styles.statValue}>
            {totalKg.toFixed(1)} <Text style={styles.unitText}>kg</Text>
          </Text>
        </View>

        {/* Daily Average */}
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statLabel}>Daily Average</Text>
          <Text style={styles.statValue}>
            {avgDaily} <Text style={styles.unitText}>kg/day</Text>
          </Text>
        </View>

        {/* Current Rate */}
        <View style={[styles.statCard, styles.rateCard]}>
          <View style={styles.rateHeader}>
            <Text style={styles.statLabel}>Monthly Rate</Text>
            {!isEditingRate && (
              <TouchableOpacity
                onPress={() => {
                  setTempRate(rate.toString());
                  setIsEditingRate(true);
                }}
              >
                <Text style={styles.editLink}>Edit ✎</Text>
              </TouchableOpacity>
            )}
          </View>
          {isEditingRate ? (
            <View style={styles.editRateRow}>
              <TextInput
                style={styles.rateInput}
                value={tempRate}
                onChangeText={setTempRate}
                keyboardType="numeric"
                autoFocus
              />
              <TouchableOpacity style={styles.saveRateBtn} onPress={handleRateSubmit}>
                <Text style={styles.saveRateBtnText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelRateBtn}
                onPress={() => setIsEditingRate(false)}
              >
                <Text style={styles.cancelRateBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.statValue}>
              {settings.currency}{rate} <Text style={styles.unitText}>/kg</Text>
            </Text>
          )}
        </View>
      </View>

      {/* Quick Action: Log Milk */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.quickAddBtn}
        onPress={() => setCurrentTab('add')}
      >
        <Text style={styles.quickAddBtnText}>+ Log Today's Milk</Text>
      </TouchableOpacity>

      {/* Recent Activity Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Deliveries</Text>
        <TouchableOpacity onPress={() => setCurrentTab('history')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {recentEntries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🥛</Text>
          <Text style={styles.emptyTitle}>No entries this month yet</Text>
          <Text style={styles.emptyDesc}>Tap the button above to log your first delivery.</Text>
        </View>
      ) : (
        recentEntries.map((entry) => (
          <View key={entry.id} style={styles.entryRow}>
            <View style={styles.entryDateBlock}>
              <Text style={styles.entryDay}>
                {new Date(entry.date).toLocaleDateString('en-US', { day: '2-digit' })}
              </Text>
              <Text style={styles.entryMonth}>
                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short' })}
              </Text>
            </View>
            <View style={styles.entryDetails}>
              <Text style={styles.entryQty}>{entry.quantity} kg</Text>
              <Text style={styles.entryNote}>
                {entry.note ? entry.note : (entry.shift ? `${entry.shift} Delivery` : 'Regular delivery')}
              </Text>
            </View>
            <Text style={styles.entryCost}>
              {settings.currency}{(parseFloat(entry.quantity) * rate).toFixed(0)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  supplierHighlight: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  shareBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  shareBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: typography.fontWeights.semibold,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.lg,
  },
  monthArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: colors.primary,
    fontSize: 14,
  },
  monthLabelContainer: {
    alignItems: 'center',
  },
  monthText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: typography.fontWeights.bold,
  },
  monthSubtext: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusPaid: {
    backgroundColor: colors.successLight,
  },
  statusUnpaid: {
    backgroundColor: colors.warningLight,
  },
  statusText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
  },
  statusPaidText: {
    color: colors.success,
  },
  statusUnpaidText: {
    color: colors.warning,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
    letterSpacing: -0.5,
    marginVertical: spacing.xs,
  },
  heroSubtext: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  rateCard: {
    width: '100%',
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: typography.fontWeights.semibold,
  },
  editRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  rateInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 8,
  },
  saveRateBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    marginRight: 4,
  },
  saveRateBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  cancelRateBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  cancelRateBtnText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: typography.fontWeights.bold,
  },
  unitText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.regular,
  },
  quickAddBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAddBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: typography.fontWeights.semibold,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: typography.fontWeights.semibold,
  },
  emptyDesc: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  entryDateBlock: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 42,
  },
  entryDay: {
    color: colors.text,
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
  entryMonth: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    textTransform: 'uppercase',
  },
  entryDetails: {
    flex: 1,
  },
  entryQty: {
    color: colors.text,
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
  entryNote: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  entryCost: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
});
