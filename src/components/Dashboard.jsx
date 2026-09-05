import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard({ 
  entries, 
  settings, 
  monthlyRates, 
  updateMonthlyRate, 
  monthlyStatus, 
  toggleMonthlyStatus, 
  currentMonth, 
  setCurrentMonth,
  showToast,
  setCurrentTab
}) {
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState('');

  const { currentUser } = useAuth();
  const userName = currentUser?.name || 'Tayyab Safdar';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'TS';

  const todayLabel = new Date().toLocaleDateString('default', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  // Format month name (e.g. 2026-06 -> June 2026)
  const getMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + direction;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    const formattedMonth = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setCurrentMonth(formattedMonth);
  };

  // Get data filtered by selected month
  const filteredEntries = entries.filter(e => e.date.startsWith(currentMonth));
  
  // Calculate stats
  const totalKg = filteredEntries.reduce((acc, entry) => acc + parseFloat(entry.quantity), 0);
  const rate = monthlyRates[currentMonth] !== undefined ? monthlyRates[currentMonth] : settings.defaultRate;
  const totalBill = totalKg * rate;
  const isPaid = monthlyStatus[currentMonth] || false;

  // Days in month calculation for progress
  const [year, mon] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const progressPercent = Math.min((filteredEntries.length / daysInMonth) * 100, 100);

  const handleRateSubmit = (e) => {
    e.preventDefault();
    const r = parseFloat(tempRate);
    if (!isNaN(r) && r >= 0) {
      updateMonthlyRate(currentMonth, r);
      setIsEditingRate(false);
      showToast(`Rate set to ${settings.currency}${r}/kg for this month.`);
    }
  };

  const startEditingRate = () => {
    setTempRate(rate.toString());
    setIsEditingRate(true);
  };

  const supplierName = settings.supplierName || settings.mamuName || 'Supplier';

  const handleShare = () => {
    const monthLabel = getMonthLabel(currentMonth);
    const text = `🥛 *Milk Report - ${monthLabel}*\n----------------------------\n*Supplier:* ${supplierName}\n*Total Milk:* ${totalKg.toFixed(2)} kg\n*Rate:* ${settings.currency}${rate}/kg\n*Total Amount:* ${settings.currency}${totalBill.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n*Status:* ${isPaid ? '✅ Paid' : '❌ Unpaid'}\n----------------------------\nGenerated via Milk Tracker`;

    if (navigator.share) {
      navigator.share({
        title: `Milk Report - ${monthLabel}`,
        text: text
      }).catch(() => {
        copyToClipboard(text);
      });
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Report copied to clipboard! Ready to share. 📋");
    }).catch(() => {
      showToast("Failed to copy report.");
    });
  };

  // Sort and take the latest 3 entries for quick view
  const recentEntries = [...filteredEntries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <div className="fade-in">
      {/* Merged Hero Billing & Profile Card (Inspired by reference app) */}
      <div className="mobile-hero-header">
        <div className="hero-orb"></div>

        {/* Top Profile Row */}
        <div className="hero-profile-row">
          <div>
            <div className="hero-welcome-text">Welcome back,</div>
            <h1 className="hero-user-name">{userName}</h1>
          </div>
          <div 
            className="hero-avatar" 
            onClick={() => setCurrentTab('settings')} 
            title="Account Settings"
          >
            <span>{initials}</span>
            <div className="hero-avatar-online"></div>
          </div>
        </div>

        {/* Integrated Month Selector */}
        <div className="hero-month-selector">
          <button className="hero-month-btn" onClick={() => changeMonth(-1)} aria-label="Previous month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="hero-month-label">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>{getMonthLabel(currentMonth)}</span>
          </div>
          <button className="hero-month-btn" onClick={() => changeMonth(1)} aria-label="Next month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        {/* Estimated Bill Display & Status Badge */}
        <div className="hero-bill-main">
          <div>
            <span className="hero-bill-label">Estimated Bill</span>
            <div className="hero-bill-amount">
              {settings.currency}{totalBill.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
          </div>
          <button 
            className={`status-badge ${isPaid ? 'paid' : 'unpaid'}`}
            onClick={() => {
              toggleMonthlyStatus(currentMonth);
              showToast(isPaid ? "Marked as Unpaid" : "Marked as Paid! 🎉");
            }}
          >
            {isPaid ? '✓ Paid' : '✗ Unpaid'}
          </button>
        </div>

        {/* Stats Row: Total Milk & Rate/kg */}
        <div className="hero-stats-row">
          <div className="stat-hero-glass">
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.75 }}>Total Milk</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: '2px' }}>
              {totalKg.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.75 }}>kg</span>
            </div>
          </div>

          <div className="stat-hero-glass" style={{ cursor: 'pointer' }} onClick={!isEditingRate ? startEditingRate : undefined}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.75 }}>Rate / Kg</span>
            {isEditingRate ? (
              <form onSubmit={handleRateSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                <input 
                  type="number" 
                  step="0.01" 
                  autoFocus 
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  onBlur={() => setIsEditingRate(false)}
                  style={{ 
                    width: '60px', 
                    padding: '4px 6px', 
                    border: '1px solid rgba(255,255,255,0.4)', 
                    borderRadius: '6px', 
                    textAlign: 'center', 
                    fontSize: '1rem', 
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.15)', 
                    color: 'white',
                    outline: 'none'
                  }}
                />
                <button type="submit" style={{ display: 'none' }} />
              </form>
            ) : (
              <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {settings.currency}{rate}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.6 }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Padded Dashboard Body */}
      <div className="dashboard-body">
        {/* Daily Insight / Monthly Pulse Card */}
        <div className="daily-insight-card fade-in-up">
          <div className="insight-header">
            <div className="insight-title-group">
              <span className="insight-title">Monthly Overview</span>
            </div>
            <span className="insight-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </span>
          </div>
          <p className="insight-text">
            {filteredEntries.length > 0
              ? `${filteredEntries.length} deliveries logged (${totalKg.toFixed(1)} kg) in ${getMonthLabel(currentMonth)}. Supplier: ${supplierName}.`
              : `No deliveries logged yet for ${getMonthLabel(currentMonth)}. Tap "Add Milk" below to start tracking.`}
          </p>
        </div>

        {/* Quick Action Cards: All Logs & Share Bill */}
        <div className="features-grid fade-in-up" style={{ animationDelay: '0.06s' }}>
          <div className="feature-card feature-card-blue" onClick={() => setCurrentTab('history')}>
            <div className="feature-icon-bubble bubble-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <span className="feature-title">All Logs</span>
            <span className="feature-subtitle">{filteredEntries.length} records this mo.</span>
          </div>

          <div className="feature-card feature-card-green" onClick={handleShare}>
            <div className="feature-icon-bubble bubble-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </div>
            <span className="feature-title">Share Bill</span>
            <span className="feature-subtitle">WhatsApp & Copy</span>
          </div>
        </div>

        {/* Month Progress Card */}
        <div className="card fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="section-header" style={{ marginBottom: '14px' }}>
          <h3 className="section-title">
            <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Month Progress
          </h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <span className="mini-stat-label">Deliveries</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {filteredEntries.length} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ {daysInMonth} days</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="mini-stat-label">Daily Avg</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {filteredEntries.length > 0 ? (totalKg / filteredEntries.length).toFixed(2) : '0.00'} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>kg</span>
            </div>
          </div>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
    </div>
  </div>
);
}
