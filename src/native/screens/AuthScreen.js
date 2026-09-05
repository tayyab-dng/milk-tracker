import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (targetMode) => {
    setMode(targetMode);
    setErrorMsg('');
    setSuccessMsg('');
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const res = await register(name, email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed.');
        } else if (res.needsEmailConfirmation) {
          setSuccessMsg(res.message || 'Account created! Please check your email to confirm, then sign in.');
          setMode('login');
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Login failed.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Ambient background glowing orbs */}
      <View style={[styles.bgOrb, styles.bgOrb1]} pointerEvents="none" />
      <View style={[styles.bgOrb, styles.bgOrb2]} pointerEvents="none" />
      <View style={[styles.bgOrb, styles.bgOrb3]} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authWrapper}>
          {/* Brand section */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoDrop}>💧</Text>
            </View>
            <Text style={styles.appTitle}>Milk Tracker</Text>
            <Text style={styles.appSubtitle}>
              {mode === 'login'
                ? 'Welcome back! Sign in to continue.'
                : 'Create your account to get started.'}
            </Text>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {/* Tab switch bar */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.tabBtn}
                onPress={() => switchMode('login')}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                  Sign In
                </Text>
                {mode === 'login' && <View style={styles.tabIndicator} />}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.tabBtn}
                onPress={() => switchMode('register')}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                  Register
                </Text>
                {mode === 'register' && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            </View>

            {/* Form content */}
            <View style={styles.formContainer}>
              {/* Error banner */}
              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Success banner */}
              {successMsg ? (
                <View style={styles.successBox}>
                  <Text style={styles.successIcon}>🎉</Text>
                  <Text style={styles.successText}>{successMsg}</Text>
                </View>
              ) : null}

              {/* Full Name field (Register only) */}
              {mode === 'register' && (
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>👤</Text>
                    <Text style={styles.inputLabel}>FULL NAME</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(255, 255, 255, 0.25)"
                    autoCapitalize="words"
                    maxLength={30}
                  />
                </View>
              )}

              {/* Email field */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.labelIcon}>✉️</Text>
                  <Text style={styles.inputLabel}>EMAIL</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.25)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password field with show/hide toggle */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.labelIcon}>🔒</Text>
                  <Text style={styles.inputLabel}>PASSWORD</Text>
                </View>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter your password'}
                    placeholderTextColor="rgba(255, 255, 255, 0.25)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.togglePasswordBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.togglePasswordIcon}>
                      {showPassword ? '👁️' : '🔒'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Gradient Submit Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === 'login' ? '➜]  Sign In' : '👤+  Create Account'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Switch mode footer */}
            <View style={styles.switchContainer}>
              {mode === 'login' ? (
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Don't have an account? </Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => switchMode('register')}>
                    <Text style={styles.switchLink}>Register</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Already have an account? </Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => switchMode('login')}>
                    <Text style={styles.switchLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Micro Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              🥛 Track milk deliveries · Calculate bills · Manage payments
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F1A',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #0C0F1A 0%, #1a1040 40%, #0C0F1A 100%)',
      minHeight: '100vh',
    }),
  },
  bgOrb: {
    position: 'absolute',
    borderRadius: 9999,
    ...(Platform.OS === 'web' && {
      filter: 'blur(80px)',
      pointerEvents: 'none',
    }),
  },
  bgOrb1: {
    width: 280,
    height: 280,
    backgroundColor: '#6366F1',
    opacity: 0.28,
    top: -60,
    right: -40,
  },
  bgOrb2: {
    width: 240,
    height: 240,
    backgroundColor: '#EC4899',
    opacity: 0.2,
    bottom: -40,
    left: -40,
  },
  bgOrb3: {
    width: 160,
    height: 160,
    backgroundColor: '#8B5CF6',
    opacity: 0.22,
    top: '40%',
    left: '20%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  authWrapper: {
    width: '100%',
    maxWidth: 410,
    alignItems: 'center',
    zIndex: 2,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoDrop: {
    fontSize: 30,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#A5B4FC',
    letterSpacing: -0.5,
    marginBottom: 6,
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #A5B4FC 0%, #818CF8 50%, #C084FC 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }),
  },
  appSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(22, 27, 46, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.18)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 36,
    elevation: 12,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    }),
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.12)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#A5B4FC',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '60%',
    height: 2.5,
    backgroundColor: '#818CF8',
    borderRadius: 2,
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)',
    }),
  },
  formContainer: {
    padding: 22,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  errorIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  successText: {
    color: '#10B981',
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  labelIcon: {
    fontSize: 12,
    marginRight: 6,
    opacity: 0.8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#F1F0FF',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.18)',
    fontSize: 14.5,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.18)',
  },
  passwordInput: {
    flex: 1,
    color: '#F1F0FF',
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14.5,
  },
  togglePasswordBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  togglePasswordIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  submitBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
    minHeight: 52,
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)',
      cursor: 'pointer',
    }),
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  switchContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.08)',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
  },
  switchLink: {
    color: '#A5B4FC',
    fontWeight: '700',
    fontSize: 13,
  },
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.28)',
    fontSize: 11.5,
    textAlign: 'center',
  },
});
