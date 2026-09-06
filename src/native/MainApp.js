import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { colors, typography, spacing, borderRadius } from './theme';
import { DEFAULT_SETTINGS } from './storage';
import dataService from '../services/dataService';
import Navbar from './components/Navbar';
import DashboardScreen from './screens/DashboardScreen';
import AddEntryScreen from './screens/AddEntryScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

function getCurrentMonthString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export default function MainApp({ userId }) {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [monthlyRates, setMonthlyRates] = useState({});
  const [monthlyStatus, setMonthlyStatus] = useState({});
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthString);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastMessage(null);
    });
  }, [toastOpacity]);

  // Load User Data on mount or user change
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [loadedEntries, loadedSettings, monthlyData] = await Promise.all([
          dataService.getEntries(userId),
          dataService.getSettings(userId),
          dataService.getMonthlyData(userId)
        ]);

        if (isMounted) {
          setEntries(loadedEntries);
          setSettings(loadedSettings);
          setMonthlyRates(monthlyData.rates || {});
          setMonthlyStatus(monthlyData.status || {});
          setIsDataLoaded(true);
        }

        // Try syncing any pending offline queue
        dataService.syncPendingQueue(userId).catch(() => {});
      } catch (err) {
        console.warn('Error loading user data:', err);
        if (isMounted) setIsDataLoaded(true);
      }
    })();

    return () => { isMounted = false; };
  }, [userId]);

  // Save changes
  const handleAddEntry = useCallback(async (newEntryData) => {
    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      ...newEntryData,
      createdAt: new Date().toISOString(),
    };

    setEntries(prev => [newEntry, ...prev]);
    await dataService.addOrUpdateEntry(userId, newEntry);
  }, [userId]);

  const handleDeleteEntry = useCallback(async (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    await dataService.deleteEntry(userId, id);
  }, [userId]);

  const handleUpdateEntry = useCallback(async (id, updatedFields) => {
    setEntries(prev => {
      const updated = prev.map(e => (e.id === id ? { ...e, ...updatedFields } : e));
      const target = updated.find(e => e.id === id);
      if (target) {
        dataService.addOrUpdateEntry(userId, target);
      }
      return updated;
    });
  }, [userId]);

  const handleUpdateSettings = useCallback(async (newSettings) => {
    setSettings(newSettings);
    await dataService.saveSettings(userId, newSettings);
  }, [userId]);

  const handleUpdateMonthlyRate = useCallback(async (month, rate) => {
    setMonthlyRates(prev => {
      const updated = { ...prev, [month]: rate };
      return updated;
    });
    await dataService.saveMonthlyRate(userId, month, rate, monthlyStatus[month]);
  }, [userId, monthlyStatus]);

  const handleToggleMonthlyStatus = useCallback(async (month) => {
    const current = monthlyStatus[month] || false;
    const newStatus = !current;
    setMonthlyStatus(prev => ({ ...prev, [month]: newStatus }));
    await dataService.saveMonthlyStatus(userId, month, newStatus, monthlyRates[month]);
    showToast(newStatus ? `Marked ${month} as Paid! ✅` : `Marked ${month} as Unpaid ⏳`);
  }, [userId, monthlyStatus, monthlyRates, showToast]);

  const handleImportData = useCallback(async (importedEntries, importedSettings, importedMonthlyRates) => {
    if (Array.isArray(importedEntries)) {
      setEntries(importedEntries);
      for (const entry of importedEntries) {
        await dataService.addOrUpdateEntry(userId, entry);
      }
    }
    if (importedSettings) {
      setSettings(importedSettings);
      await dataService.saveSettings(userId, importedSettings);
    }
    if (importedMonthlyRates) {
      setMonthlyRates(importedMonthlyRates);
    }
  }, [userId]);

  const handleResetData = useCallback(async () => {
    setEntries([]);
    setMonthlyRates({});
    setMonthlyStatus({});
    await dataService.resetUserData(userId);
  }, [userId]);

  if (!isDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your milk data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Active Screen */}
      <View style={styles.screenContainer}>
        {currentTab === 'dashboard' && (
          <DashboardScreen
            entries={entries}
            settings={settings}
            monthlyRates={monthlyRates}
            updateMonthlyRate={handleUpdateMonthlyRate}
            monthlyStatus={monthlyStatus}
            toggleMonthlyStatus={handleToggleMonthlyStatus}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            setCurrentTab={setCurrentTab}
            showToast={showToast}
          />
        )}

        {currentTab === 'add' && (
          <AddEntryScreen
            onAddEntry={handleAddEntry}
            settings={settings}
            showToast={showToast}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'history' && (
          <HistoryScreen
            entries={entries}
            onDeleteEntry={handleDeleteEntry}
            onUpdateEntry={handleUpdateEntry}
            settings={settings}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            monthlyRates={monthlyRates}
            showToast={showToast}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            updateMonthlyRate={handleUpdateMonthlyRate}
            currentMonth={currentMonth}
            onResetData={handleResetData}
            onImportData={handleImportData}
            entries={entries}
            monthlyRates={monthlyRates}
            showToast={showToast}
            setCurrentTab={setCurrentTab}
          />
        )}
      </View>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Bottom Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  toast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  toastText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: typography.fontWeights.semibold,
  },
});
