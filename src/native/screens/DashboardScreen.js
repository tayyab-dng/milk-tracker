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

    const userName = settings.userName || 'Tayyab Safdar';
    const initials = userName
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'TS';

    const todayLabel = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Curved Hero Header: Profile + Month Selector + Merged Bill Card */}
      <View style={styles.heroHeaderContainer}>
        {/* Profile Row */}
        <View style={styles.heroProfileRow}>
          <View>
            <Text style={styles.heroGreeting}>Welcome back,</Text>
            <Text style={styles.heroUserName}>{userName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.heroAvatar} 
            activeOpacity={0.8}
            onPress={() => setCurrentTab && setCurrentTab('settings')}
          >
            <Text style={styles.heroAvatarText}>{initials}</Text>
            <View style={styles.heroAvatarDot} />
          </TouchableOpacity>
        </View>

        {/* Integrated Month Navigator */}
        <View style={styles.heroMonthSelector}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.heroMonthArrow}
            onPress={() => changeMonth(-1)}
          >
            <Text style={styles.heroArrowText}>◀</Text>
          </TouchableOpacity>
          <View style={styles.heroMonthLabelContainer}>
            <Text style={styles.heroMonthText}>{getMonthLabel(currentMonth)}</Text>
            <Text style={styles.heroMonthSubtext}>{daysLogged} of {daysInMonth} days logged</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.heroMonthArrow}
            onPress={() => changeMonth(1)}
          >
            <Text style={styles.heroArrowText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Bill Row & Paid Status */}
        <View style={styles.heroBillRow}>
          <View>
            <Text style={styles.heroBillLabel}>ESTIMATED BILL</Text>
            <Text style={styles.heroBillAmount}>
              {settings.currency}{totalBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
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

        {/* Stats Row: Total Milk & Rate */}
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatGlass}>
            <Text style={styles.heroStatLabel}>TOTAL MILK</Text>
            <Text style={styles.heroStatValue}>{totalKg.toFixed(1)} <Text style={styles.heroStatUnit}>kg</Text></Text>
          </View>
          <TouchableOpacity 
            style={styles.heroStatGlass}
            activeOpacity={0.7}
            onPress={() => {
              setTempRate(rate.toString());
              setIsEditingRate(true);
            }}
          >
            <Text style={styles.heroStatLabel}>RATE / KG</Text>
            <Text style={styles.heroStatValue}>{settings.currency}{rate} ✎</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Insight / Monthly Overview Card */}
      <View style={styles.dailyInsightCard}>
        <View style={styles.insightHeader}>
          <Text style={styles.insightTitle}>Monthly Overview</Text>
          <Text style={styles.insightIcon}>💡</Text>
        </View>
        <Text style={styles.insightText}>
          {filteredEntries.length > 0
            ? `${filteredEntries.length} deliveries logged (${totalKg.toFixed(1)} kg) in ${getMonthLabel(currentMonth)}. Supplier: ${settings.supplierName || 'Supplier'}.`
            : `No deliveries logged yet for ${getMonthLabel(currentMonth)}. Tap "Add Milk" below to start tracking.`}
        </Text>
      </View>

      {/* Quick Action Cards: All Logs & Share Bill */}
      <View style={styles.featuresGrid}>
        <TouchableOpacity 
          style={[styles.featureCard, styles.featureCardBlue]}
          activeOpacity={0.7}
          onPress={() => setCurrentTab && setCurrentTab('history')}
        >
          <View style={[styles.featureIconBubble, styles.bubbleBlue]}>
            <Text style={styles.featureIconText}>📋</Text>
          </View>
          <Text style={styles.featureTitle}>All Logs</Text>
          <Text style={styles.featureSubtitle}>{filteredEntries.length} records this mo.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.featureCard, styles.featureCardGreen]}
          activeOpacity={0.7}
          onPress={handleShareReport}
        >
          <View style={[styles.featureIconBubble, styles.bubbleGreen]}>
            <Text style={styles.featureIconText}>📤</Text>
          </View>
          <Text style={styles.featureTitle}>Share Bill</Text>
          <Text style={styles.featureSubtitle}>WhatsApp & SMS</Text>
        </TouchableOpacity>
      </View>

      {/* Month Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Month Progress</Text>
        </View>
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.miniStatLabel}>DELIVERIES</Text>
            <Text style={styles.miniStatValue}>
              {filteredEntries.length} <Text style={styles.miniStatUnit}>/ {daysInMonth} days</Text>
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.miniStatLabel}>DAILY AVG</Text>
            <Text style={styles.miniStatValue}>
              {avgDaily} <Text style={styles.miniStatUnit}>kg</Text>
            </Text>
          </View>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${Math.min((filteredEntries.length / daysInMonth) * 100, 100)}%` }]} />
        </View>
      </View>
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
  // Curved Hero Header
  heroHeaderContainer: {
    backgroundColor: '#1E1B4B',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(129, 140, 248, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  heroMonthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  heroMonthArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroArrowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: typography.fontWeights.bold,
  },
  heroMonthLabelContainer: {
    alignItems: 'center',
  },
  heroMonthText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
  heroMonthSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
  },
  heroBillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroBillLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.8,
  },
  heroBillAmount: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: typography.fontWeights.extraBold,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroStatGlass: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  heroStatLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  heroStatUnit: {
    fontSize: 11,
    fontWeight: 'normal',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  heroProfileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroGreeting: {
    color: '#A5B4FC',
    fontSize: 13,
    fontWeight: typography.fontWeights.medium,
    marginBottom: 2,
  },
  heroUserName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: typography.fontWeights.extraBold,
    letterSpacing: -0.5,
  },
  heroAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  heroAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: typography.fontWeights.bold,
  },
  heroAvatarDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: '#1E1B4B',
  },

  // Daily Insight Card
  dailyInsightCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  insightTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: typography.fontWeights.bold,
  },
  insightIcon: {
    fontSize: 16,
  },
  insightText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },

  // 2x2 Feature Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderLeftWidth: 4,
    marginBottom: spacing.sm,
  },
  featureCardPurple: {
    borderLeftColor: '#818CF8',
  },
  featureCardBlue: {
    borderLeftColor: '#38BDF8',
  },
  featureCardAmber: {
    borderLeftColor: '#F59E0B',
  },
  featureCardGreen: {
    borderLeftColor: '#10B981',
  },
  featureIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  bubblePurple: {
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
  },
  bubbleBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  bubbleAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  bubbleGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  featureIconText: {
    fontSize: 16,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 2,
  },
  featureSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
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
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  progressHeader: {
    marginBottom: spacing.md,
  },
  progressTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  miniStatLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  miniStatValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: typography.fontWeights.extraBold,
  },
  miniStatUnit: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: 'normal',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  statusPaid: {
    backgroundColor: '#10B981',
  },
  statusUnpaid: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: typography.fontWeights.extraBold,
  },
  statusPaidText: {
    color: '#FFFFFF',
  },
  statusUnpaidText: {
    color: '#FFFFFF',
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
