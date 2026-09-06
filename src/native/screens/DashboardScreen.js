import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Share,
  Alert,
  Platform
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useAuth } from '../contexts/AuthContext';

// Clean SVG helper for Web
function Icon({ type, color = 'currentColor', size = 18 }) {
  if (Platform.OS === 'web') {
    if (type === 'calendar') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    }
    if (type === 'sun') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    }
    if (type === 'document') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    }
    if (type === 'share') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      );
    }
    if (type === 'chart') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    }
    if (type === 'edit') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    }
  }

  // Fallback minimalist text
  const glyphs = { calendar: '📅', sun: '☼', document: '📄', share: '↗', chart: '📊', edit: '✎' };
  return <Text style={{ color, fontSize: size - 2 }}>{glyphs[type] || '•'}</Text>;
}

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
  const { currentUser } = useAuth();
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState('');

  const userName = currentUser?.name || settings.userName || 'Tayyab Safdar';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'TS';

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
  const progressPercent = Math.min((filteredEntries.length / daysInMonth) * 100, 100);
  const avgDaily = filteredEntries.length > 0 ? (totalKg / filteredEntries.length).toFixed(2) : '0.00';

  const handleRateSubmit = () => {
    const r = parseFloat(tempRate);
    if (!isNaN(r) && r >= 0) {
      updateMonthlyRate(currentMonth, r);
      setIsEditingRate(false);
      showToast(`Rate set to ${settings.currency}${r}/kg for this month.`);
    } else {
      Alert.alert('Invalid Rate', 'Please enter a valid numeric rate.');
    }
  };

  const handleShareReport = async () => {
    const monthLabel = getMonthLabel(currentMonth);
    const supplier = settings.supplierName || 'Supplier';
    const message = 
      `*Milk Report - ${monthLabel}*\n` +
      `----------------------------\n` +
      `*Supplier:* ${supplier}\n` +
      `*Total Milk:* ${totalKg.toFixed(2)} kg\n` +
      `*Rate:* ${settings.currency}${rate}/kg\n` +
      `*Total Amount:* ${settings.currency}${totalBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `*Status:* ${isPaid ? 'Paid' : 'Unpaid'}\n` +
      `----------------------------\n` +
      `Generated via Milk Tracker`;

    if (Platform.OS === 'web' && navigator?.clipboard) {
      navigator.clipboard.writeText(message).then(() => {
        showToast('Report copied to clipboard! Ready to share.');
      }).catch(() => {
        Share.share({ message }).catch(() => {});
      });
    } else {
      try {
        await Share.share({ message });
      } catch (error) {
        console.warn('Share error:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Vibrant Hero Card (Expanded to Top, Left, and Right edges) */}
        <View style={styles.heroCard}>
        {/* Profile Row */}
        <View style={styles.profileRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userNameText}>{userName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.avatarCircle} 
            activeOpacity={0.8}
            onPress={() => setCurrentTab && setCurrentTab('settings')}
          >
            <Text style={styles.avatarInitials}>{initials}</Text>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>

        {/* Integrated Month Selector */}
        <View style={styles.monthSelectorBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.monthArrowBtn}
            onPress={() => changeMonth(-1)}
          >
            <Text style={styles.monthArrowText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.monthLabelBox}>
            <Icon type="calendar" color="#FFFFFF" size={15} />
            <Text style={styles.monthLabelText}>{getMonthLabel(currentMonth)}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.monthArrowBtn}
            onPress={() => changeMonth(1)}
          >
            <Text style={styles.monthArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Estimated Bill & Status Pill */}
        <View style={styles.billRow}>
          <View>
            <Text style={styles.billLabel}>ESTIMATED BILL</Text>
            <Text style={styles.billAmount}>
              {settings.currency}{totalBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.statusPill, isPaid ? styles.statusPaidPill : styles.statusUnpaidPill]}
            onPress={() => {
              toggleMonthlyStatus(currentMonth);
            }}
          >
            <Text style={styles.statusPillText}>
              {isPaid ? '✓ Paid' : '✗ Unpaid'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row: Total Milk & Rate/kg */}
        <View style={styles.statsRow}>
          <View style={styles.glassStatBox}>
            <Text style={styles.statLabel}>TOTAL MILK</Text>
            <Text style={styles.statValue}>
              {totalKg.toFixed(1)} <Text style={styles.statUnit}>kg</Text>
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.glassStatBox}
            activeOpacity={0.7}
            onPress={() => {
              setTempRate(rate.toString());
              setIsEditingRate(true);
            }}
          >
            <Text style={styles.statLabel}>RATE / KG</Text>
            {isEditingRate ? (
              <View style={styles.rateEditRow}>
                <TextInput
                  style={styles.rateInput}
                  value={tempRate}
                  onChangeText={setTempRate}
                  keyboardType="numeric"
                  autoFocus
                  onBlur={handleRateSubmit}
                  onSubmitEditing={handleRateSubmit}
                />
              </View>
            ) : (
              <View style={styles.rateDisplayRow}>
                <Text style={styles.statValue}>{settings.currency}{rate}</Text>
                <View style={{ marginLeft: 5 }}>
                  <Icon type="edit" color="rgba(255, 255, 255, 0.7)" size={12} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

        {/* Dashboard Body Content with Standard Side Margins */}
        <View style={styles.bodyContent}>
          {/* Monthly Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Monthly Overview</Text>
              <Icon type="sun" color="#38BDF8" size={17} />
            </View>
            <Text style={styles.overviewText}>
              {filteredEntries.length > 0
                ? `${filteredEntries.length} deliveries logged (${totalKg.toFixed(1)} kg) in ${getMonthLabel(currentMonth)}. Supplier: ${settings.supplierName || 'Supplier'}.`
                : `No deliveries logged yet for ${getMonthLabel(currentMonth)}. Tap "Add Milk" below to start tracking.`}
            </Text>
          </View>

          {/* Quick Action Grid: All Logs & Share Bill */}
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.actionCardBlue]}
              activeOpacity={0.7}
              onPress={() => setCurrentTab && setCurrentTab('history')}
            >
              <View style={[styles.actionIconBubble, styles.bubbleBlue]}>
                <Icon type="document" color="#38BDF8" size={20} />
              </View>
              <Text style={styles.actionTitle}>All Logs</Text>
              <Text style={styles.actionSubtitle}>{filteredEntries.length} records this mo.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, styles.actionCardGreen]}
              activeOpacity={0.7}
              onPress={handleShareReport}
            >
              <View style={[styles.actionIconBubble, styles.bubbleGreen]}>
                <Icon type="share" color="#10B981" size={20} />
              </View>
              <Text style={styles.actionTitle}>Share Bill</Text>
              <Text style={styles.actionSubtitle}>WhatsApp & Copy</Text>
            </TouchableOpacity>
          </View>

          {/* Month Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressTitleGroup}>
                <View style={{ marginRight: 8 }}>
                  <Icon type="chart" color="#818CF8" size={17} />
                </View>
                <Text style={styles.progressTitle}>Month Progress</Text>
              </View>
            </View>

            <View style={styles.progressMetricsRow}>
              <View>
                <Text style={styles.metricLabel}>DELIVERIES</Text>
                <Text style={styles.metricValue}>
                  {filteredEntries.length} <Text style={styles.metricUnit}>/ {daysInMonth} days</Text>
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metricLabel}>DAILY AVG</Text>
                <Text style={styles.metricValue}>
                  {avgDaily} <Text style={styles.metricUnit}>kg</Text>
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F1A',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #0C0F1A 0%, #1a1040 40%, #0C0F1A 100%)',
    }),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  bodyContent: {
    paddingHorizontal: 16,
  },
  // Top Hero Gradient Card (Expanded to Top, Left, and Right edges)
  heroCard: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 84,
    paddingBottom: 26,
    marginBottom: 16,
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.38,
    shadowRadius: 30,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 40%, #EC4899 100%)',
      boxShadow: '0 20px 48px rgba(99, 102, 241, 0.38)',
    }),
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0C0F1A',
  },
  // Month Navigator
  monthSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 22,
  },
  monthArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthArrowText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  monthLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthLabelText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  // Bill Row
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  billLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  billAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  statusPill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  statusPaidPill: {
    backgroundColor: '#10B981',
  },
  statusUnpaidPill: {
    backgroundColor: '#EF4444',
  },
  statusPillText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13.5,
    letterSpacing: 0.3,
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  glassStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(12px)',
    }),
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.78)',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statUnit: {
    fontSize: 12.5,
    fontWeight: '500',
    opacity: 0.85,
  },
  rateDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateEditRow: {
    marginTop: 2,
  },
  rateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    width: 75,
  },
  // Monthly Overview Card
  overviewCard: {
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.16)',
    borderLeftWidth: 3.5,
    borderLeftColor: '#06B6D4',
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overviewText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 19,
  },
  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.16)',
    borderLeftWidth: 3.5,
  },
  actionCardBlue: {
    borderLeftColor: '#38BDF8',
  },
  actionCardGreen: {
    borderLeftColor: '#10B981',
  },
  actionIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bubbleBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
  },
  bubbleGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  // Month Progress Card
  progressCard: {
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.16)',
  },
  progressHeader: {
    marginBottom: 14,
  },
  progressTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
    }),
  },
});
