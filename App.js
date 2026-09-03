import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  ActivityIndicator,
  Text,
  Platform
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/native/contexts/AuthContext';
import AuthScreen from './src/native/screens/AuthScreen';
import MainApp from './src/native/MainApp';
import { colors } from './src/native/theme';

function RootContent() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🥛</Text>
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={styles.loadingText}>Opening Milk Tracker...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return <MainApp userId={currentUser.id} />;
}

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" backgroundColor="#0C0F1A" />
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  logoEmoji: {
    fontSize: 38,
  },
  spinner: {
    marginVertical: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
