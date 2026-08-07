import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings({ settings, onUpdateSettings, onImportData, onResetData, entries, monthlyRates, showToast }) {
  const { currentUser, logout, changePassword, updateProfile } = useAuth();

  const [supplierName, setSupplierName] = useState(settings.supplierName || settings.mamuName || 'Supplier');
  const [defaultRate, setDefaultRate] = useState(settings.defaultRate || 60);
  const [currency, setCurrency] = useState(settings.currency || '₹');
  const [defaultQuantity, setDefaultQuantity] = useState(settings.defaultQuantity || 1.0);
  const [quickQuantitiesText, setQuickQuantitiesText] = useState((settings.quickQuantities || [0.5, 1.0, 1.5, 2.0]).join(', '));

  // Change password state
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Logout state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    
    // Parse quick quantities
    const quickQuantities = quickQuantitiesText
      .split(',')
      .map(item => parseFloat(item.trim()))
      .filter(num => !isNaN(num) && num > 0);

    if (quickQuantities.length === 0) {
      showToast("Please enter at least one valid number for Quick Add options.");
      return;
    }

    const rateNum = parseFloat(defaultRate);
    const qtyNum = parseFloat(defaultQuantity);

    if (isNaN(rateNum) || rateNum < 0) {
      showToast("Please enter a valid default rate.");
      return;
    }

    if (isNaN(qtyNum) || qtyNum <= 0) {
      showToast("Please enter a valid default quantity.");
      return;
    }

    onUpdateSettings({
      supplierName: supplierName.trim(),
      defaultRate: rateNum,
      currency: currency.trim(),
      defaultQuantity: qtyNum,
      quickQuantities
    });

    showToast("Settings saved successfully! ⚙️");
  };

  const handleExport = () => {
    try {
      const backupData = {
        entries,
        settings,
        monthlyRates,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `milk-tracker-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Backup downloaded successfully! 💾");
    } catch (err) {
      showToast("Failed to export backup data.");
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.entries && parsed.settings) {
          onImportData(parsed.entries, parsed.settings, parsed.monthlyRates || {});
          showToast("Data restored successfully from backup! 🎉");
          setSupplierName(parsed.settings.supplierName || parsed.settings.mamuName || 'Supplier');
          setDefaultRate(parsed.settings.defaultRate || 60);
          setCurrency(parsed.settings.currency || '₹');
          setDefaultQuantity(parsed.settings.defaultQuantity || 1.0);
          setQuickQuantitiesText((parsed.settings.quickQuantities || [0.5, 1.0, 1.5, 2.0]).join(', '));
        } else {
          showToast("Invalid backup file format.");
        }
      } catch (err) {
        showToast("Error reading backup file.");
      }
    };
    reader.readAsText(file);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetClick = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    onResetData();
    setSupplierName('Supplier');
    setDefaultRate(60);
    setCurrency('₹');
    setDefaultQuantity(1.0);
    setQuickQuantitiesText('0.5, 1.0, 1.5, 2.0');
    setShowResetConfirm(false);
    showToast("App data reset to defaults.");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwLoading(true);

    try {
      const result = await changePassword(currentPw, newPw);
      if (result.success) {
        showToast("Password changed successfully! 🔒");
        setShowChangePw(false);
        setCurrentPw('');
        setNewPw('');
      } else {
        setPwError(result.error);
      }
    } catch {
      setPwError('An error occurred.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="fade-in">
      <h2 className="page-title">Settings</h2>
      
      {/* Profile Section */}
      <div className="card fade-in-up stagger-1">
        <div className="profile-card">
          <div className="profile-avatar">{userInitials}</div>
          <div className="profile-info">
            <div className="profile-name">{currentUser?.name || 'User'}</div>
            <div className="profile-email">{currentUser?.email || ''}</div>
          </div>
        </div>

        {/* Change Password */}
        {showChangePw ? (
          <form className="change-pw-section" onSubmit={handleChangePassword}>
            {pwError && (
              <div style={{ 
                background: 'var(--error-light)', 
                color: 'var(--error)', 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-sm)', 
                fontSize: '0.82rem', 
                fontWeight: 500,
                border: '1px solid rgba(239, 68, 68, 0.15)'
              }}>
                {pwError}
              </div>
            )}
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ fontSize: '0.7rem' }}>Current Password</label>
              <input
                type="password"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ fontSize: '0.7rem' }}>New Password</label>
              <input
                type="password"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                minLength={4}
                placeholder="Min 4 characters"
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '9px', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
                onClick={() => { setShowChangePw(false); setPwError(''); setCurrentPw(''); setNewPw(''); }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '9px', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
                disabled={pwLoading}
              >
                {pwLoading ? '...' : 'Update'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1, fontSize: '0.82rem', padding: '9px', borderRadius: 'var(--radius-full)' }}
              onClick={() => setShowChangePw(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Change Password
            </button>
            {showLogoutConfirm ? (
              <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, fontSize: '0.78rem', padding: '9px', borderRadius: 'var(--radius-full)' }}
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  No
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  style={{ flex: 1, fontSize: '0.78rem', padding: '9px', borderRadius: 'var(--radius-full)' }}
                  onClick={handleLogout}
                >
                  Yes
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                className="btn btn-danger" 
                style={{ flex: 1, fontSize: '0.82rem', padding: '9px', borderRadius: 'var(--radius-full)' }}
                onClick={() => setShowLogoutConfirm(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            )}
          </div>
        )}
      </div>

      {/* General Settings */}
      <div className="settings-section fade-in-up stagger-2">
        <div className="settings-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          General
        </div>

        <form onSubmit={handleSave} className="card">
          {/* Supplier Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="setting-supplier">Supplier Name</label>
            <input 
              type="text" 
              id="setting-supplier"
              className="form-control"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              required
              maxLength="25"
              placeholder="e.g. Ram, Sharma Ji..."
            />
          </div>

          {/* Currency Symbol */}
          <div className="form-group">
            <label className="form-label" htmlFor="setting-currency">Currency Symbol</label>
            <input 
              type="text" 
              id="setting-currency"
              className="form-control"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
              maxLength="5"
            />
          </div>

          {/* Default Rate */}
          <div className="form-group">
            <label className="form-label" htmlFor="setting-rate">Default Rate per kg</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              id="setting-rate"
              className="form-control"
              value={defaultRate}
              onChange={(e) => setDefaultRate(e.target.value)}
              required
            />
          </div>

          {/* Default Quantity */}
          <div className="form-group">
            <label className="form-label" htmlFor="setting-qty">Default Daily Quantity (kg)</label>
            <input 
              type="number" 
              step="0.1"
              min="0.1"
              id="setting-qty"
              className="form-control"
              value={defaultQuantity}
              onChange={(e) => setDefaultQuantity(e.target.value)}
              required
            />
          </div>

          {/* Quick Add Presets */}
          <div className="form-group">
            <label className="form-label" htmlFor="setting-presets">Quick Add Buttons (kg, comma-separated)</label>
            <input 
              type="text" 
              id="setting-presets"
              className="form-control"
              value={quickQuantitiesText}
              onChange={(e) => setQuickQuantitiesText(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Save Settings
          </button>
        </form>
      </div>

      {/* Backup & Restore */}
      <div className="settings-section fade-in-up stagger-3">
        <div className="settings-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Backup & Restore
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={handleExport}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Backup (.json)
          </button>

          <label className="btn btn-secondary" style={{ width: '100%', display: 'flex', cursor: 'pointer', margin: 0, boxSizing: 'border-box' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Import Backup (.json)
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section fade-in-up stagger-4">
        <div className="danger-zone">
          <div className="settings-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Danger Zone
          </div>
          
          {showResetConfirm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--error)', fontWeight: 600, margin: 0 }}>
                ⚠️ This will permanently delete ALL your milk data. This cannot be undone!
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
                  onClick={handleResetClick}
                >
                  Yes, Erase All
                </button>
              </div>
            </div>
          ) : (
            <button 
              type="button" 
              className="btn btn-danger" 
              style={{ width: '100%' }}
              onClick={handleResetClick}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Erase All Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
