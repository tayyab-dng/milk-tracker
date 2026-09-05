import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

// SVG Icon Helper for Web with clean fallback
function HistoryIcon({ type, color = 'currentColor', size = 18 }) {
  if (Platform.OS === 'web') {
    if (type === 'back') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    }
    if (type === 'list') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      );
    }
    if (type === 'clipboardEmpty') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="13" y2="16" />
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
    if (type === 'trash') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    }
  }

  const glyphs = { back: '‹', list: '≡', clipboardEmpty: '📄', edit: '✎', trash: '×' };
  return <Text style={{ color, fontSize: size - 2 }}>{glyphs[type] || '•'}</Text>;
}

export default function HistoryScreen({
  entries,
  onDeleteEntry,
  onUpdateEntry,
  settings,
  currentMonth,
  setCurrentMonth,
  monthlyRates,
  showToast,
  setCurrentTab
}) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');

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

  const filteredEntries = entries
    .filter(e => e.date && e.date.startsWith(currentMonth))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalKg = filteredEntries.reduce((acc, entry) => acc + (parseFloat(entry.quantity) || 0), 0);
  const rate = monthlyRates[currentMonth] !== undefined ? monthlyRates[currentMonth] : (settings.defaultRate || 60);
  const totalBill = totalKg * rate;

  const handleStartEdit = (entry) => {
    setEditingEntry(entry);
    setEditQty(entry.quantity.toString());
    setEditDate(entry.date);
    setEditNote(entry.note || '');
  };

  const handleSaveEdit = () => {
    const qty = parseFloat(editQty);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid numeric quantity.');
      return;
    }

    onUpdateEntry(editingEntry.id, {
      date: editDate,
      quantity: qty,
      note: editNote.trim()
    });

    setEditingEntry(null);
    showToast('Entry updated successfully!');
  };

  const handleDeleteConfirm = (id, dateStr) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete the entry for ${dateStr}?`)) {
        onDeleteEntry(id);
        showToast('Entry deleted.');
      }
      return;
    }

    Alert.alert(
      'Delete Delivery',
      `Are you sure you want to delete the entry for ${dateStr}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeleteEntry(id);
            showToast('Entry deleted.');
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const itemDate = new Date(item.date);
    const formattedDate = !isNaN(itemDate.getTime())
      ? itemDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
      : item.date;
    const cost = (parseFloat(item.quantity) * rate).toFixed(2);

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryMain}>
          <View style={styles.entryHeaderRow}>
            <Text style={styles.entryDateText}>{formattedDate}</Text>
            <View style={styles.entryActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.iconActionBtn}
                onPress={() => handleStartEdit(item)}
              >
                <HistoryIcon type="edit" color="#818CF8" size={15} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.iconActionBtn, styles.deleteActionBtn]}
                onPress={() => handleDeleteConfirm(item.id, item.date)}
              >
                <HistoryIcon type="trash" color="#EF4444" size={15} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.entryBodyRow}>
            <View>
              <Text style={styles.entryQtyText}>
                {item.quantity} <Text style={styles.entryQtyUnit}>kg</Text>
              </Text>
              <Text style={styles.entryNoteText} numberOfLines={1}>
                {item.note ? item.note : (item.shift ? `${item.shift} Shift` : 'Daily Delivery')}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.entryCostLabel}>Cost</Text>
              <Text style={styles.entryCostValue}>
                {settings.currency}{cost}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Area - Preserving Top Spacing as Empty Space */}
      <View style={styles.topSpacer} />

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Month Selector Card */}
            <View style={styles.monthSelectorCard}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.monthArrowBtn}
                onPress={() => changeMonth(-1)}
              >
                <Text style={styles.monthArrowText}>‹</Text>
              </TouchableOpacity>

              <Text style={styles.monthNameText}>{getMonthLabel(currentMonth)}</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.monthArrowBtn}
                onPress={() => changeMonth(1)}
              >
                <Text style={styles.monthArrowText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Mini Stats Bar with Violet Accent Left Border */}
            <View style={styles.miniStatsBar}>
              <View style={styles.miniStatCol}>
                <Text style={styles.miniStatLabel}>MONTH TOTAL</Text>
                <Text style={styles.miniStatValueTotal}>{totalKg.toFixed(1)} kg</Text>
              </View>

              <View style={[styles.miniStatCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.miniStatLabel}>MONTH BILL</Text>
                <Text style={styles.miniStatValueBill}>
                  {settings.currency}{totalBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {/* Section Header: Logs (N) */}
            <View style={styles.logsHeaderRow}>
              <View style={{ marginRight: 8 }}>
                <HistoryIcon type="list" color="#818CF8" size={17} />
              </View>
              <Text style={styles.logsHeaderText}>Logs ({filteredEntries.length})</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          /* Empty State Card Matching Vite Exactly */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBadge}>
              <HistoryIcon type="clipboardEmpty" color="#818CF8" size={44} />
            </View>
            <Text style={styles.emptyTitle}>No logs found for this month.</Text>
            <Text style={styles.emptySubtitle}>
              Use the <Text style={{ color: '#A5B4FC', fontWeight: '700' }}>Add</Text> button to log deliveries.
            </Text>
          </View>
        }
      />

      {/* Edit Entry Modal */}
      {editingEntry && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Edit Milk Entry</Text>

              <Text style={styles.modalLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.modalInput}
                value={editDate}
                onChangeText={setEditDate}
              />

              <Text style={styles.modalLabel}>Quantity (kg)</Text>
              <TextInput
                style={styles.modalInput}
                value={editQty}
                onChangeText={setEditQty}
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Note</Text>
              <TextInput
                style={styles.modalInput}
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Optional note"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setEditingEntry(null)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.modalSaveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  topSpacer: {
    height: 60,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  // Month Selector Card
  monthSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.16)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  monthArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  monthArrowText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  monthNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Mini Stats Bar
  miniStatsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.16)',
    borderLeftWidth: 3.5,
    borderLeftColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  miniStatCol: {
    justifyContent: 'center',
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  miniStatValueTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  miniStatValueBill: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Logs Section Header
  logsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  logsHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Empty State Card
  emptyCard: {
    backgroundColor: 'rgba(22, 27, 46, 0.75)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Entry Card
  entryCard: {
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.14)',
    padding: 14,
    marginBottom: 10,
  },
  entryMain: {
    gap: 8,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 8,
  },
  entryDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  entryBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  entryQtyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  entryQtyUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  entryNoteText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  entryCostLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
  },
  entryCostValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#818CF8',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#161B2E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.18)',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14.5,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalCancelBtnText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    fontSize: 13,
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: '#6366F1',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
