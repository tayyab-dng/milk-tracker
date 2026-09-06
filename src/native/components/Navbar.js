import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

// Clean SVG Icon render helper for Web with minimalist fallbacks
function NavIcon({ type, color, size = 22 }) {
  if (Platform.OS === 'web') {
    if (type === 'home') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    }
    if (type === 'history') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    }
    if (type === 'add') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    }
    if (type === 'settings') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    }
  }

  // Fallback minimalist text/glyph
  const glyphs = { home: '⌂', history: '⏱', add: '+', settings: '⚙' };
  return <Text style={{ color, fontSize: 18, fontWeight: '700' }}>{glyphs[type] || '•'}</Text>;
}

export default function Navbar({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', type: 'home' },
    { id: 'history', label: 'History', type: 'history' },
    { id: 'add', label: 'Add', type: 'add', isCenter: true },
    { id: 'settings', label: 'Settings', type: 'settings' }
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;

        if (tab.isCenter) {
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.85}
              style={styles.navItemAdd}
              onPress={() => setCurrentTab(tab.id)}
            >
              <View style={[styles.navFab, isActive && styles.navFabActive]}>
                <NavIcon type="add" color="#FFFFFF" size={24} />
              </View>
              <Text style={[styles.navItemAddLabel, isActive && styles.navItemLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        const activeColor = '#818CF8';
        const inactiveColor = 'rgba(255, 255, 255, 0.45)';

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            style={styles.navItem}
            onPress={() => setCurrentTab(tab.id)}
          >
            {isActive && <View style={styles.activeTopBar} />}
            <View style={styles.iconWrapper}>
              <NavIcon
                type={tab.type}
                color={isActive ? activeColor : inactiveColor}
                size={22}
              />
            </View>
            <Text style={[styles.navItemLabel, isActive && styles.navItemLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: 'rgba(12, 15, 26, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 14 : 0,
    zIndex: 999,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    }),
  },
  navItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
    gap: 4,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  activeTopBar: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#818CF8',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    }),
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  navItemLabelActive: {
    color: '#818CF8',
    fontWeight: '700',
  },
  navItemAdd: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  navFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    borderWidth: 4,
    borderColor: '#0C0F1A',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    }),
  },
  navFabActive: {},
  navItemAddLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
