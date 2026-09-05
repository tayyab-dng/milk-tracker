import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Share
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen({
  settings,
  onUpdateSettings,
  onResetData,
  entries,
  monthlyRates,
  showToast
}) {
  const { currentUser, logout, changePassword, updateProfile } = useAuth();

  const [supplierName, setSupplierName] = useState(settings.supplierName || 'Supplier');
  const [defaultRate, setDefaultRate] = useState((settings.defaultRate || 60).toString());
  const [currency, setCurrency] = useState(settings.currency || 'PKR');
  const [defaultQuantity, setDefaultQuantity] = useState((settings.defaultQuantity || 1.0).toString());
  const [quickQuantitiesText, setQuickQuantitiesText] = useState(
    (settings.quickQuantities || [0.5, 1.0, 1.5, 2.0]).join(', ')
  );

  // Change password states
  const [showPwSection, setShowPwSection] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const currencies = ['PKR', 'Rs.', '$', '€', '£'];

  const handleSaveSettings = () => {
    if (!supplierName.trim()) {
      Alert.alert('Invalid Supplier', 'Please enter a valid supplier name.');
      return;
    }

    onUpdateSettings({
      ...settings,
      supplierName: supplierName.trim()
    });

    showToast('Settings saved successfully! ⚙️');
  };

  const handleExportBackup = async () => {
    try {
      const backupData = {
        entries,
        settings,
        monthlyRates,
        exportDate: new Date().toISOString()
      };
      const jsonStr = JSON.stringify(backupData, null, 2);
      await Share.share({
        title: 'Milk Tracker Backup',
        message: jsonStr
      });
    } catch (err) {
      console.warn('Backup export error:', err);
    }
  };

  const handleResetConfirm = () => {
    Alert.alert(
      'Reset All Milk Data',
      'This will erase all delivery records and monthly rates. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            onResetData();
            showToast('All milk data reset. 🔄');
          }
        }
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Missing Fields', 'Please enter both your current and new password.');
      return;
    }
    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      Alert.alert('Success', 'Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setShowPwSection(false);
    } else {
      Alert.alert('Error', res.error || 'Failed to change password.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>App Settings ⚙️</Text>
      <Text style={styles.pageSubtitle}>Configure pricing, suppliers, and presets</Text>

      {/* Supplier & Pricing */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Supplier & Pricing</Text>

        <Text style={styles.fieldLabel}>Supplier / Milkman Name</Text>
        <TextInput
          style={styles.input}
          value={supplierName}
          onChangeText={setSupplierName}
          placeholder="e.g. Ramesh, Daily Dairy"
          placeholderTextColor={colors.textMuted}
        />

      </View>

      {/* Save Settings Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.saveBtn}
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveBtnText}>Save Preferences</Text>
      </TouchableOpacity>

      {/* Account Info */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Account</Text>
        <View style={styles.accountRow}>
          <Text style={styles.accountName}>{currentUser?.name || 'User'}</Text>
          <Text style={styles.accountEmail}>{currentUser?.email || ''}</Text>
        </View>

        {!showPwSection ? (
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => setShowPwSection(true)}
          >
            <Text style={styles.linkBtnText}>Change Password 🔒</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.pwContainer}>
            <TextInput
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Current password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password (min 4 chars)"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
            <View style={styles.pwActionsRow}>
              <TouchableOpacity
                style={styles.pwCancelBtn}
                onPress={() => setShowPwSection(false)}
              >
                <Text style={styles.pwCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pwSaveBtn}
                onPress={handleChangePassword}
              >
                <Text style={styles.pwSaveBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoutBtn}
          onPress={logout}
        >
          <Text style={styles.logoutBtnText}>Log Out 🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Data & Backup</Text>
        <Text style={styles.descText}>
          Total records: {entries.length} deliveries tracked.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backupBtn}
          onPress={handleExportBackup}
        >
          <Text style={styles.backupBtnText}>Export JSON Backup 💾</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.resetBtn}
          onPress={handleResetConfirm}
        >
          <Text style={styles.resetBtnText}>Clear All Milk Records ⚠️</Text>
        </TouchableOpacity>
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
  sectionHeading: {
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.inputBg,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  currencyChip: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  currencyChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  currencyChipText: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.bold,
  },
  currencyChipTextActive: {
    color: colors.primary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
  accountRow: {
    marginBottom: spacing.md,
  },
  accountName: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  accountEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  linkBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: spacing.sm,
  },
  linkBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: typography.fontWeights.semibold,
  },
  pwContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  pwActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  pwCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  pwCancelBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  pwSaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  pwSaveBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: typography.fontWeights.bold,
  },
  logoutBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: spacing.xs,
  },
  logoutBtnText: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semibold,
    fontSize: 13,
  },
  descText: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  backupBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  backupBtnText: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
    fontSize: 13,
  },
  resetBtn: {
    backgroundColor: colors.dangerLight,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resetBtnText: {
    color: colors.danger,
    fontWeight: typography.fontWeights.semibold,
    fontSize: 13,
  },
});
