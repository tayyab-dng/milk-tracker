import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

export default function Navbar({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'add', label: 'Add', icon: '+', isCenter: true },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          if (tab.isCenter) {
            const isActive = currentTab === tab.id;
            return (
              <View key={tab.id} style={styles.centerButtonWrapper}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.centerButton, isActive && styles.centerButtonActive]}
                  onPress={() => setCurrentTab(tab.id)}
                >
                  <Text style={styles.centerButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            );
          }

          const isActive = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              style={styles.tabButton}
              onPress={() => setCurrentTab(tab.id)}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingHorizontal: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    height: 64,
    paddingHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  centerButtonWrapper: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.background,
  },
  centerButtonActive: {
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
  },
  centerButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 32,
  },
});
