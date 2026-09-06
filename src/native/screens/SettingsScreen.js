import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Clean SVG Icons for Web with minimalist fallbacks
function SettingsIcon({ type, color = 'currentColor', size = 18 }) {
  if (Platform.OS === 'web') {
    if (type === 'back') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    }
    if (type === 'lock') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    }
    if (type === 'logout') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    }
    if (type === 'gear') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    }
    if (type === 'save') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      );
    }
    if (type === 'download') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    }
    if (type === 'upload') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    }
    if (type === 'alert') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
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

  const glyphs = {
    back: '‹',
    lock: '🔒',
    logout: '→',
    gear: '⚙',
    save: '💾',
    download: '⬇',
    upload: '⬆',
    alert: '⚠',
    trash: '✕'
  };
  return <Text style={{ color, fontSize: size - 2, fontWeight: '700' }}>{glyphs[type] || '•'}</Text>;
}

export default function SettingsScreen({
  settings,
  onUpdateSettings,
  onResetData,
  onImportData,
  entries = [],
  monthlyRates = {},
  showToast,
  setCurrentTab
}) {
  const { currentUser, logout, changePassword } = useAuth();

  const [supplierName, setSupplierName] = useState(settings?.supplierName || settings?.mamuName || 'Supplier');

  // Change password states
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Logout state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    if (!supplierName.trim()) {
      showToast ? showToast('Please enter a valid supplier name.') : Alert.alert('Error', 'Please enter a valid supplier name.');
      return;
    }

    onUpdateSettings({
      ...settings,
      supplierName: supplierName.trim()
    });

    showToast ? showToast('Settings saved successfully!') : Alert.alert('Success', 'Settings saved successfully!');
  };

  const handleResetClick = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    onResetData && onResetData();
    setSupplierName('Supplier');
    setShowResetConfirm(false);
    showToast ? showToast('App data reset to defaults.') : Alert.alert('Reset', 'App data reset to defaults.');
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) {
      setPwError('Please fill in both fields.');
      return;
    }
    if (newPw.length < 4) {
      setPwError('New password must be at least 4 characters.');
      return;
    }

    setPwError('');
    setPwLoading(true);

    try {
      const result = await changePassword(currentPw, newPw);
      if (result.success) {
        showToast ? showToast('Password changed successfully!') : Alert.alert('Success', 'Password changed successfully!');
        setShowChangePw(false);
        setCurrentPw('');
        setNewPw('');
      } else {
        setPwError(result.error || 'Failed to change password.');
      }
    } catch {
      setPwError('An unexpected error occurred.');
    } finally {
      setPwLoading(false);
    }
  };

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'TS';

  return (
    <View style={styles.container}>
      {/* Top Header Area - Preserving Top Spacing as Empty Space to match History */}
      <View style={styles.topSpacer} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Profile Section Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{userInitials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser?.name || 'Tayyab Safdar'}</Text>
              <Text style={styles.profileEmail}>{currentUser?.email || 'tayyabsafdar560@gmail.com'}</Text>
            </View>
          </View>

          {/* Change Password Form or Actions Row */}
          {showChangePw ? (
            <View style={styles.changePwForm}>
              {!!pwError && (
                <View style={styles.pwErrorBox}>
                  <Text style={styles.pwErrorText}>{pwError}</Text>
                </View>
              )}
              <View style={styles.pwFieldGroup}>
                <Text style={styles.pwFieldLabel}>CURRENT PASSWORD</Text>
                <TextInput
                  style={styles.pwInput}
                  value={currentPw}
                  onChangeText={setCurrentPw}
                  secureTextEntry
                  placeholder="Enter current password"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
              </View>
              <View style={styles.pwFieldGroup}>
                <Text style={styles.pwFieldLabel}>NEW PASSWORD</Text>
                <TextInput
                  style={styles.pwInput}
                  value={newPw}
                  onChangeText={setNewPw}
                  secureTextEntry
                  placeholder="Min 4 characters"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
              </View>
              <View style={styles.pwButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.pwCancelBtn}
                  onPress={() => {
                    setShowChangePw(false);
                    setPwError('');
                    setCurrentPw('');
                    setNewPw('');
                  }}
                >
                  <Text style={styles.pwCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.pwSubmitBtn}
                  onPress={handleChangePassword}
                  disabled={pwLoading}
                >
                  {pwLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.pwSubmitBtnText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.profileSecondaryBtn}
                onPress={() => setShowChangePw(true)}
              >
                <SettingsIcon type="lock" color="#818CF8" size={14} />
                <Text style={styles.profileSecondaryBtnText}>Change Password</Text>
              </TouchableOpacity>

              {showLogoutConfirm ? (
                <View style={styles.logoutConfirmRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.logoutNoBtn}
                    onPress={() => setShowLogoutConfirm(false)}
                  >
                    <Text style={styles.logoutNoBtnText}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.logoutYesBtn}
                    onPress={logout}
                  >
                    <Text style={styles.logoutYesBtnText}>Yes</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.logoutBtn}
                  onPress={() => setShowLogoutConfirm(true)}
                >
                  <SettingsIcon type="logout" color="#EF4444" size={14} />
                  <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* 2. General Settings Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <SettingsIcon type="gear" color="#818CF8" size={15} />
            <Text style={styles.sectionHeaderText}>GENERAL</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>SUPPLIER NAME</Text>
            <TextInput
              style={styles.input}
              value={supplierName}
              onChangeText={setSupplierName}
              maxLength={25}
              placeholder="e.g. Supplier name..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.saveSettingsBtn}
              onPress={handleSave}
            >
              <SettingsIcon type="save" color="#FFFFFF" size={18} />
              <Text style={styles.saveSettingsBtnText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Danger Zone Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.dangerZoneCard}>
            <View style={styles.dangerSectionHeader}>
              <SettingsIcon type="alert" color="#EF4444" size={15} />
              <Text style={styles.dangerSectionHeaderText}>DANGER ZONE</Text>
            </View>

            {showResetConfirm ? (
              <View style={styles.dangerConfirmContainer}>
                <Text style={styles.dangerWarningText}>
                  This will permanently delete ALL your milk data. This cannot be undone!
                </Text>
                <View style={styles.dangerButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.dangerCancelBtn}
                    onPress={() => setShowResetConfirm(false)}
                  >
                    <Text style={styles.dangerCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.dangerConfirmBtn}
                    onPress={handleResetClick}
                  >
                    <Text style={styles.dangerConfirmBtnText}>Yes, Erase All</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.eraseDataBtn}
                onPress={handleResetClick}
              >
                <SettingsIcon type="trash" color="#EF4444" size={17} />
                <Text style={styles.eraseDataBtnText}>Erase All Data</Text>
              </TouchableOpacity>
            )}
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
  topSpacer: {
    height: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  // Cards
  card: {
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.16)',
    padding: 18,
    marginBottom: 20,
  },

  // Profile Section
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B5CF6',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    }),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  profileEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  profileActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileSecondaryBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  profileSecondaryBtnText: {
    color: '#818CF8',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutConfirmRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  logoutNoBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  logoutNoBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutYesBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  logoutYesBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },

  // Change Password Form
  changePwForm: {
    marginTop: 4,
  },
  pwErrorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  pwErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  pwFieldGroup: {
    marginBottom: 10,
  },
  pwFieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  pwInput: {
    backgroundColor: 'rgba(13, 16, 32, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  pwButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  pwCancelBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  pwCancelBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  pwSubmitBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      cursor: 'pointer',
    }),
  },
  pwSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Section Headers
  sectionContainer: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },

  // Field & Inputs
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(13, 16, 32, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  saveSettingsBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      cursor: 'pointer',
    }),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveSettingsBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Danger Zone
  dangerZoneCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.22)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  dangerSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  dangerSectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 1,
  },
  eraseDataBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  eraseDataBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerConfirmContainer: {
    gap: 12,
  },
  dangerWarningText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  dangerButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dangerCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  dangerCancelBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dangerConfirmBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  dangerConfirmBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
