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

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (isRegister) {
        const res = await register(name, email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed.');
        } else if (res.needsEmailConfirmation) {
          setSuccessMsg(res.message || 'Account created! Please check your email to confirm, then sign in.');
          setIsRegister(false);
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Login failed.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🥛</Text>
          </View>
          <Text style={styles.appTitle}>Milk Tracker</Text>
          <Text style={styles.appTagline}>Smart Daily Milk Supply & Bill Manager</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.tabBtn, !isRegister && styles.tabBtnActive]}
              onPress={() => {
                setIsRegister(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              <Text style={[styles.tabBtnText, !isRegister && styles.tabBtnTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.tabBtn, isRegister && styles.tabBtnActive]}
              onPress={() => {
                setIsRegister(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              <Text style={[styles.tabBtnText, isRegister && styles.tabBtnTextActive]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>🎉 {successMsg}</Text>
            </View>
          ) : null}

          {isRegister && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. user@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isRegister ? 'Create Account' : 'Sign In to Tracker'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  logoEmoji: {
    fontSize: 34,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semibold,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeights.bold,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    padding: 10,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 12,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successText: {
    color: '#10B981',
    fontSize: 12,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBg,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
});
