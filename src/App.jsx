import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import AddEntry from './components/AddEntry';
import HistoryList from './components/HistoryList';
import Settings from './components/Settings';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import './App.css';

// Per-user localStorage key generators
const getEntriesKey = (userId) => `milk_tracker_${userId}_entries`;
const getSettingsKey = (userId) => `milk_tracker_${userId}_settings`;
const getRatesKey = (userId) => `milk_tracker_${userId}_rates`;
const getStatusKey = (userId) => `milk_tracker_${userId}_status`;

const DEFAULT_SETTINGS = {
  supplierName: 'Supplier',
  defaultRate: 60,
  currency: 'PKR',
  defaultQuantity: 1.0,
  quickQuantities: [0.5, 1.0, 1.5, 2.0]
};

export default function App() {
  const { currentUser, isLoading } = useAuth();

  // Show loading while restoring session
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner"></div>
      </div>
    );
  }

  // Not logged in → show auth screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  // Logged in → show main app with user-scoped data
  return <MainApp userId={currentUser.id} />;
}

function MainApp({ userId }) {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Local States
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [monthlyRates, setMonthlyRates] = useState({});
  const [monthlyStatus, setMonthlyStatus] = useState({});
  
  // Active Month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');
  const [toastShow, setToastShow] = useState(false);

  // Load data from per-user localStorage keys
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(getEntriesKey(userId));
      if (storedEntries) setEntries(JSON.parse(storedEntries));
      else setEntries([]);

      const storedSettings = localStorage.getItem(getSettingsKey(userId));
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        // Migrate old 'mamuName' key to 'supplierName'
        if (parsed.mamuName && !parsed.supplierName) {
          parsed.supplierName = parsed.mamuName;
          delete parsed.mamuName;
        }
        // Auto-migrate old default '₹' to 'PKR'
        if (!parsed.currency || parsed.currency === '₹') {
          parsed.currency = 'PKR';
          localStorage.setItem(getSettingsKey(userId), JSON.stringify(parsed));
        }
        setSettings(parsed);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }

      const storedRates = localStorage.getItem(getRatesKey(userId));
      if (storedRates) setMonthlyRates(JSON.parse(storedRates));
      else setMonthlyRates({});

      const storedStatus = localStorage.getItem(getStatusKey(userId));
      if (storedStatus) setMonthlyStatus(JSON.parse(storedStatus));
      else setMonthlyStatus({});
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, [userId]);

  // Helper function to trigger a notification toast
  const showToast = useCallback((message) => {
    setToastMessage(message);
    setToastShow(true);
  }, []);

  useEffect(() => {
    if (toastShow) {
      const timer = setTimeout(() => {
        setToastShow(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastShow]);

  // Save actions — scoped to current user
  const saveEntries = useCallback((newEntries) => {
    setEntries(newEntries);
    localStorage.setItem(getEntriesKey(userId), JSON.stringify(newEntries));
  }, [userId]);

  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem(getSettingsKey(userId), JSON.stringify(newSettings));
  }, [userId]);

  const saveMonthlyRates = useCallback((newRates) => {
    setMonthlyRates(newRates);
    localStorage.setItem(getRatesKey(userId), JSON.stringify(newRates));
  }, [userId]);

  const saveMonthlyStatus = useCallback((newStatus) => {
    setMonthlyStatus(newStatus);
    localStorage.setItem(getStatusKey(userId), JSON.stringify(newStatus));
  }, [userId]);

  // State mutators
  const addEntry = useCallback((newEntry) => {
    const entryWithId = {
      ...newEntry,
      id: Date.now().toString()
    };
    saveEntries([...entries, entryWithId]);
  }, [entries, saveEntries]);

  const updateEntry = useCallback((id, updatedFields) => {
    const updatedEntries = entries.map(entry => 
      entry.id === id ? { ...entry, ...updatedFields } : entry
    );
    saveEntries(updatedEntries);
  }, [entries, saveEntries]);

  const deleteEntry = useCallback((id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
  }, [entries, saveEntries]);

  const updateSettings = useCallback((newSettings) => {
    saveSettings(newSettings);
  }, [saveSettings]);

  const updateMonthlyRate = useCallback((monthStr, rate) => {
    const updatedRates = {
      ...monthlyRates,
      [monthStr]: rate
    };
    saveMonthlyRates(updatedRates);
  }, [monthlyRates, saveMonthlyRates]);

  const toggleMonthlyStatus = useCallback((monthStr) => {
    const updatedStatus = {
      ...monthlyStatus,
      [monthStr]: !monthlyStatus[monthStr]
    };
    saveMonthlyStatus(updatedStatus);
  }, [monthlyStatus, saveMonthlyStatus]);

  const importData = useCallback((importedEntries, importedSettings, importedRates) => {
    saveEntries(importedEntries);
    saveSettings(importedSettings);
    saveMonthlyRates(importedRates);
    saveMonthlyStatus({});
  }, [saveEntries, saveSettings, saveMonthlyRates, saveMonthlyStatus]);

  const resetData = useCallback(() => {
    localStorage.removeItem(getEntriesKey(userId));
    localStorage.removeItem(getSettingsKey(userId));
    localStorage.removeItem(getRatesKey(userId));
    localStorage.removeItem(getStatusKey(userId));
    setEntries([]);
    setSettings(DEFAULT_SETTINGS);
    setMonthlyRates({});
    setMonthlyStatus({});
  }, [userId]);

  // Get formatted current date for subtitle
  const todayLabel = new Date().toLocaleDateString('default', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <>
      {/* Toast Notification */}
      <div className={`toast ${toastShow ? 'show' : ''}`}>
        <span>{toastMessage}</span>
        <button className="toast-close" onClick={() => setToastShow(false)}>×</button>
      </div>

      {/* Sub-Page Header (Only on Add, History, Settings) */}
      {currentTab !== 'dashboard' && (
        <header className="sub-page-header">
          <button className="sub-header-back" onClick={() => setCurrentTab('dashboard')} aria-label="Back to Home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <h2 className="sub-header-title">
            {currentTab === 'add' && 'Add Daily Milk'}
            {currentTab === 'history' && 'Delivery History'}
            {currentTab === 'settings' && 'Settings'}
          </h2>
          <div style={{ width: '38px' }}></div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="app-content">

        {currentTab === 'dashboard' && (
          <Dashboard 
            entries={entries}
            settings={settings}
            monthlyRates={monthlyRates}
            updateMonthlyRate={updateMonthlyRate}
            monthlyStatus={monthlyStatus}
            toggleMonthlyStatus={toggleMonthlyStatus}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            showToast={showToast}
            setCurrentTab={setCurrentTab}
          />
        )}
        
        {currentTab === 'add' && (
          <div className="sub-page-body">
            <AddEntry 
              onAddEntry={addEntry}
              settings={settings}
              showToast={showToast}
              setCurrentTab={setCurrentTab}
            />
          </div>
        )}

        {currentTab === 'history' && (
          <div className="sub-page-body">
            <HistoryList 
              entries={entries}
              onDeleteEntry={deleteEntry}
              onUpdateEntry={updateEntry}
              settings={settings}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              monthlyRates={monthlyRates}
              showToast={showToast}
            />
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="sub-page-body">
            <Settings 
              settings={settings}
              onUpdateSettings={updateSettings}
              onImportData={importData}
              onResetData={resetData}
              entries={entries}
              monthlyRates={monthlyRates}
              showToast={showToast}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </>
  );
}
