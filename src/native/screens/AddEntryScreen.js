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

// Clean SVG icons for Web with minimalist fallbacks
function AddIcon({ type, color = 'currentColor', size = 18 }) {
  if (Platform.OS === 'web') {
    if (type === 'back') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    }
    if (type === 'calendar') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    }
    if (type === 'droplet') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C12 2 6 10 6 14.5C6 17.8 8.7 21 12 21C15.3 21 18 17.8 18 14.5C18 10 12 2 12 2Z" />
        </svg>
      );
    }
    if (type === 'shift') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
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
    if (type === 'moon') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    }
    if (type === 'notes') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    }
    if (type === 'save') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      );
    }
    if (type === 'check') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }
  }

  const glyphs = {
    back: '‹',
    calendar: '📅',
    droplet: '💧',
    shift: '⏱',
    sun: '☼',
    moon: '☾',
    notes: '✎',
    save: '💾',
    check: '✓'
  };
  return <Text style={{ color, fontSize: size - 2, fontWeight: '700' }}>{glyphs[type] || '•'}</Text>;
}

export default function AddEntryScreen({
  onAddEntry,
  settings = {},
  showToast,
  setCurrentTab
}) {
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getTodayString());
  const [quantity, setQuantity] = useState(
    settings.defaultQuantity ? settings.defaultQuantity.toString() : '1.0'
  );
  const [shift, setShift] = useState('Morning');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

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
      if (showToast) {
        showToast('Please enter a valid quantity of milk.');
      } else {
        Alert.alert('Invalid Quantity', 'Please enter a valid amount of milk.');
      }
      return;
    }

    onAddEntry({
      date,
      quantity: parsedQty,
      shift,
      note: note.trim()
    });

    setSaved(true);
    if (showToast) {
      showToast(`Logged ${parsedQty} kg for ${new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}!`);
    }

    setTimeout(() => {
      setSaved(false);
      setNote('');
      if (setCurrentTab) setCurrentTab('dashboard');
    }, 550);
  };

  const quickBtns = settings.quickQuantities || [0.5, 1.0, 1.5, 2.0];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <View style={styles.container}>
        {/* Top Header Area - Preserving Top Spacing as Empty Space to match History */}
        <View style={styles.topSpacer} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContent}>
            {/* 1. Quantity Stepper & Quick Presets */}
            <View style={styles.formGroup}>
              {/* Glowing Circular Stepper */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.stepperAdjustBtn}
                  onPress={() => adjustQuantity(-0.5)}
                >
                  <Text style={styles.stepperAdjustBtnText}>−</Text>
                </TouchableOpacity>

                <View style={styles.qtyValueCircle}>
                  <Text style={styles.qtyNumber}>
                    {parseFloat(quantity || 0).toFixed(1)}
                  </Text>
                  <Text style={styles.qtyUnit}>kg</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.stepperAdjustBtn}
                  onPress={() => adjustQuantity(0.5)}
                >
                  <Text style={styles.stepperAdjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Presets Grid (4 columns) */}
              <View style={styles.quickGrid}>
                {quickBtns.map((val) => {
                  const isSelected = Math.abs(parseFloat(quantity || 0) - val) < 0.05;
                  return (
                    <TouchableOpacity
                      key={val}
                      activeOpacity={0.8}
                      style={[
                        styles.quickBtn,
                        isSelected && styles.quickBtnActive
                      ]}
                      onPress={() => handleQuickSelect(val)}
                    >
                      <Text
                        style={[
                          styles.quickBtnText,
                          isSelected && styles.quickBtnTextActive
                        ]}
                      >
                        {val} kg
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Delivery Shift (Morning / Evening) */}
            <View style={styles.formGroup}>
              <View style={styles.shiftRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.shiftBtn,
                    shift === 'Morning' && styles.shiftBtnActive
                  ]}
                  onPress={() => setShift('Morning')}
                >
                  <AddIcon
                    type="sun"
                    color={shift === 'Morning' ? '#FFFFFF' : '#818CF8'}
                    size={16}
                  />
                  <Text
                    style={[
                      styles.shiftBtnText,
                      shift === 'Morning' && styles.shiftBtnTextActive
                    ]}
                  >
                    Morning
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.shiftBtn,
                    shift === 'Evening' && styles.shiftBtnActive
                  ]}
                  onPress={() => setShift('Evening')}
                >
                  <AddIcon
                    type="moon"
                    color={shift === 'Evening' ? '#FFFFFF' : '#818CF8'}
                    size={16}
                  />
                  <Text
                    style={[
                      styles.shiftBtnText,
                      shift === 'Evening' && styles.shiftBtnTextActive
                    ]}
                  >
                    Evening
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Date Field */}
            <View style={styles.formGroup}>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'rgba(22, 27, 46, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 16,
                    padding: '0 16px',
                    height: 52,
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: 'inherit',
                    colorScheme: 'dark'
                  }}
                />
              ) : (
                <TextInput
                  style={styles.textInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
              )}
            </View>

            {/* 4. Notes Input */}
            <View style={styles.formGroup}>
              <View style={styles.fieldLabelRow}>
                <AddIcon type="notes" color="#818CF8" size={14} />
                <Text style={styles.fieldLabel}>NOTES (OPTIONAL)</Text>
              </View>

              <TextInput
                style={styles.textInput}
                value={note}
                onChangeText={setNote}
                placeholder="e.g. morning, afternoon, extra curd..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                maxLength={40}
              />
            </View>
          </View>

          {/* 5. Save Button (Anchored towards bottom) */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
              onPress={handleSubmit}
              disabled={saved}
            >
              {saved ? (
                <>
                  <AddIcon type="check" color="#FFFFFF" size={18} />
                  <Text style={styles.saveBtnText}>Saved!</Text>
                </>
              ) : (
                <>
                  <AddIcon type="save" color="#FFFFFF" size={18} />
                  <Text style={styles.saveBtnText}>Save Log</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
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
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 110,
    justifyContent: 'space-between',
  },
  formContent: {
    flex: 1,
  },
  actionContainer: {
    marginTop: 20,
  },

  // Form Groups
  formGroup: {
    marginBottom: 18,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 14.5,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // Shift Row (Morning / Evening)
  shiftRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shiftBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  shiftBtnActive: {
    backgroundColor: '#6366F1',
    borderColor: 'transparent',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      boxShadow: '0 6px 18px rgba(99, 102, 241, 0.35)',
    }),
  },
  shiftBtnText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  shiftBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Stepper & Circle
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
    marginTop: 4,
  },
  stepperAdjustBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }),
  },
  stepperAdjustBtnText: {
    color: '#818CF8',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
  qtyValueCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#8B5CF6',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
    }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNumber: {
    fontFamily: Platform.OS === 'web' ? 'Outfit, sans-serif' : undefined,
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  qtyUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // Quick Add Grid
  quickGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  quickBtnActive: {
    backgroundColor: '#6366F1',
    borderColor: 'transparent',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    }),
  },
  quickBtnText: {
    color: '#C7D2FE',
    fontSize: 13,
    fontWeight: '600',
  },
  quickBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Save Button
  saveBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
      cursor: 'pointer',
    }),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveBtnSuccess: {
    backgroundColor: '#10B981',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
    }),
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
