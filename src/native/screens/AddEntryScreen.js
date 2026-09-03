import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

export default function AddEntryScreen({
  onAddEntry,
  settings,
  showToast,
  setCurrentTab
}) {
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getTodayString(0));
  const [quantity, setQuantity] = useState(settings.defaultQuantity ? settings.defaultQuantity.toString() : '1.0');
  const [shift, setShift] = useState('Morning');
  const [note, setNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (settings.defaultQuantity) {
      setQuantity(settings.defaultQuantity.toString());
    }
  }, [settings.defaultQuantity]);

  const adjustQuantity = (amount) => {
    const currentVal = parseFloat(quantity) || 0;
    const newVal = Math.max(0.1, currentVal + amount);
    setQuantity(newVal.toFixed(1));
  };

  const handleQuickSelect = (val) => {
    setQuantity(val.toString());
  };

  const handleSubmit = () => {
    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid amount of milk (kg/L).');
      return;
    }

    onAddEntry({
      date,
      quantity: parsedQty,
      shift,
      note: note.trim()
    });

    setIsSaved(true);
    showToast(`Logged ${parsedQty} kg for ${date}! 🥛`);

    setTimeout(() => {
      setIsSaved(false);
      setNote('');
      setCurrentTab('dashboard');
    }, 500);
  };

  const quickBtns = settings.quickQuantities || [0.5, 1.0, 1.5, 2.0];
  const isToday = date === getTodayString(0);
  const isYesterday = date === getTodayString(1);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Log Milk Delivery 🥛</Text>
        <Text style={styles.pageSubtitle}>Record today's milk supply</Text>

        {/* Date Shortcuts */}
        <View style={styles.card}>
          <Text style={styles.label}>Select Date</Text>
          <View style={styles.dateButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.dateChip, isToday && styles.dateChipActive]}
              onPress={() => setDate(getTodayString(0))}
            >
              <Text style={[styles.dateChipText, isToday && styles.dateChipTextActive]}>
                Today ({new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.dateChip, isYesterday && styles.dateChipActive]}
              onPress={() => setDate(getTodayString(1))}
            >
              <Text style={[styles.dateChipText, isYesterday && styles.dateChipTextActive]}>
                Yesterday
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateInputWrapper}>
            <Text style={styles.dateInputLabel}>Custom Date (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.dateInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Shift Toggle */}
        <View style={styles.card}>
          <Text style={styles.label}>Delivery Shift</Text>
          <View style={styles.shiftRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.shiftBtn, shift === 'Morning' && styles.shiftBtnActive]}
              onPress={() => setShift('Morning')}
            >
              <Text style={styles.shiftEmoji}>🌅</Text>
              <Text style={[styles.shiftText, shift === 'Morning' && styles.shiftTextActive]}>
                Morning
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.shiftBtn, shift === 'Evening' && styles.shiftBtnActive]}
              onPress={() => setShift('Evening')}
            >
              <Text style={styles.shiftEmoji}>🌙</Text>
              <Text style={[styles.shiftText, shift === 'Evening' && styles.shiftTextActive]}>
                Evening
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantity Stepper */}
        <View style={styles.card}>
          <Text style={styles.label}>Quantity (kg / liters)</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.stepBtn}
              onPress={() => adjustQuantity(-0.5)}
            >
              <Text style={styles.stepBtnText}>-0.5</Text>
            </TouchableOpacity>

            <View style={styles.qtyDisplay}>
              <TextInput
                style={styles.qtyInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                selectTextOnFocus
              />
              <Text style={styles.qtyUnit}>kg / L</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.stepBtn}
              onPress={() => adjustQuantity(0.5)}
            >
              <Text style={styles.stepBtnText}>+0.5</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Select Chips */}
          <View style={styles.quickChipsRow}>
            {quickBtns.map((val) => {
              const isSelected = parseFloat(quantity) === val;
              return (
                <TouchableOpacity
                  key={val}
                  activeOpacity={0.8}
                  style={[styles.quickChip, isSelected && styles.quickChipActive]}
                  onPress={() => handleQuickSelect(val)}
                >
                  <Text style={[styles.quickChipText, isSelected && styles.quickChipTextActive]}>
                    {val} kg
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Note / Remarks */}
        <View style={styles.card}>
          <Text style={styles.label}>Note / Remarks (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="e.g., extra buffalo milk, cash paid, etc."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.saveBtn, isSaved && styles.saveBtnSuccess]}
          onPress={handleSubmit}
        >
          <Text style={styles.saveBtnText}>
            {isSaved ? '✓ Saved Successfully!' : 'Save Delivery Entry'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  dateButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  dateChip: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dateChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  dateChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: typography.fontWeights.medium,
  },
  dateChipTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  dateInputWrapper: {
    marginTop: 4,
  },
  dateInputLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: colors.inputBg,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontSize: 14,
  },
  shiftRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shiftBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  shiftBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  shiftEmoji: {
    fontSize: 18,
  },
  shiftText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: typography.fontWeights.medium,
  },
  shiftTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stepBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  stepBtnText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: typography.fontWeights.bold,
  },
  qtyDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    color: colors.text,
    fontSize: 42,
    fontWeight: typography.fontWeights.extraBold,
    textAlign: 'center',
    minWidth: 100,
  },
  qtyUnit: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: -4,
  },
  quickChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickChip: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  quickChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: typography.fontWeights.semibold,
  },
  quickChipTextActive: {
    color: colors.primary,
  },
  noteInput: {
    backgroundColor: colors.inputBg,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnSuccess: {
    backgroundColor: colors.success,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
  },
});
