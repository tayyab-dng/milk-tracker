import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

export default function HistoryScreen({
  entries,
  onDeleteEntry,
  onUpdateEntry,
  settings,
  currentMonth,
  setCurrentMonth,
  monthlyRates,
  showToast
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
    showToast('Entry updated successfully! ✏️');
  };

  const handleDeleteConfirm = (id, dateStr) => {
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
            showToast('Entry deleted. 🗑️');
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const itemDate = new Date(item.date);
    const day = !isNaN(itemDate.getTime())
      ? itemDate.toLocaleDateString('en-US', { day: '2-digit' })
      : item.date;
    const monthName = !isNaN(itemDate.getTime())
      ? itemDate.toLocaleDateString('en-US', { month: 'short' })
      : '';
    const cost = (parseFloat(item.quantity) * rate).toFixed(0);

    return (
      <View style={styles.card}>
        <View style={styles.cardDateCol}>
          <Text style={styles.cardDay}>{day}</Text>
          <Text style={styles.cardMonth}>{monthName}</Text>
        </View>

        <View style={styles.cardDetailsCol}>
          <Text style={styles.cardQty}>{item.quantity} kg</Text>
          <Text style={styles.cardNote} numberOfLines={1}>
            {item.note ? item.note : (item.shift ? `${item.shift} Shift` : 'Daily Delivery')}
          </Text>
        </View>

        <View style={styles.cardCostCol}>
          <Text style={styles.cardCost}>{settings.currency}{cost}</Text>
        </View>

        <View style={styles.actionsCol}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleStartEdit(item)}
          >
            <Text style={styles.actionBtnText}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionDeleteBtn]}
            onPress={() => handleDeleteConfirm(item.id, item.date)}
          >
            <Text style={styles.actionDeleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Month Navigator Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Delivery History 📋</Text>

        <View style={styles.monthRow}>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => changeMonth(-1)}>
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{getMonthLabel(currentMonth)}</Text>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => changeMonth(1)}>
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Pill Bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>DELIVERIES</Text>
            <Text style={styles.summaryValue}>{filteredEntries.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL KG</Text>
            <Text style={styles.summaryValue}>{totalKg.toFixed(1)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL BILL</Text>
            <Text style={styles.summaryValue}>
              {settings.currency}{totalBill.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>

      {/* List of Entries */}
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No records for this month</Text>
            <Text style={styles.emptySubtitle}>Log deliveries using the (+) button below.</Text>
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
                placeholderTextColor={colors.textMuted}
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
                  <Text style={styles.modalSaveBtnText}>Save Changes</Text>
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
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: colors.primary,
    fontSize: 12,
  },
  monthText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.cardBorder,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  cardDateCol: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 44,
  },
  cardDay: {
    color: colors.text,
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
  },
  cardMonth: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    textTransform: 'uppercase',
  },
  cardDetailsCol: {
    flex: 1,
  },
  cardQty: {
    color: colors.text,
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
  },
  cardNote: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  cardCostCol: {
    marginRight: spacing.md,
  },
  cardCost: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
  actionsCol: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  actionDeleteBtn: {
    backgroundColor: colors.dangerLight,
  },
  actionDeleteBtnText: {
    color: colors.danger,
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.inputBg,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontSize: 15,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: spacing.xl,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
  },
  modalCancelBtnText: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semibold,
  },
  modalSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  modalSaveBtnText: {
    color: '#FFF',
    fontWeight: typography.fontWeights.bold,
  },
});
