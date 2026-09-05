import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

// Clean SVG Icon render helper for Web with fallback
function NavIcon({ type, color, size = 22 }) {
  if (Platform.OS === 'web') {
    if (type === 'home') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    }
    if (type === 'history') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    }
    if (type === 'settings') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    }
  }

  // Fallback minimalist text/glyph
  const glyphs = { home: '⌂', history: '⏱', settings: '⚙' };
  return <Text style={{ color, fontSize: 18, fontWeight: '700' }}>{glyphs[type] || '•'}</Text>;
}

export default function Navbar({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', type: 'home' },
    { id: 'history', label: 'History', type: 'history' },
    { id: 'add', label: 'Add', isCenter: true },
    { id: 'settings', label: 'Settings', type: 'settings' }
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
          const activeColor = '#A5B4FC';
          const inactiveColor = 'rgba(255, 255, 255, 0.4)';

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              style={styles.tabButton}
              onPress={() => setCurrentTab(tab.id)}
            >
              {isActive && <View style={styles.activeTopBar} />}
              <View style={styles.iconWrapper}>
                <NavIcon
                  type={tab.type}
                  color={isActive ? activeColor : inactiveColor}
                  size={20}
                />
              </View>
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
    zIndex: 999,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(18, 23, 42, 0.85)',
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.18)',
    height: 64,
    paddingHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activeTopBar: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#818CF8',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(90deg, #6366F1, #A78BFA)',
    }),
  },
  iconWrapper: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#A5B4FC',
    fontWeight: '700',
  },
  centerButtonWrapper: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#0C0F1A',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45), 0 0 16px rgba(236, 72, 153, 0.3)',
      cursor: 'pointer',
    }),
  },
  centerButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  centerButtonText: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 30,
  },
});
