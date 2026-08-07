import React, { useState } from 'react';

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
      {/* Month Selector */}
      <div className="month-selector">
        <button className="month-btn" onClick={() => changeMonth(-1)} aria-label="Previous month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <h2 className="month-name">{getMonthLabel(currentMonth)}</h2>
        <button className="month-btn" onClick={() => changeMonth(1)} aria-label="Next month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      {/* Hero Billing Card */}
      <div className="card card-hero fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="hero-orb"></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', position: 'relative', zIndex: 1 }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
              Estimated Bill
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: '4px', letterSpacing: '-1px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', position: 'relative', zIndex: 1 }}>
          <div className="stat-hero-glass">
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>Total Milk</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: '2px' }}>
              {totalKg.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.7 }}>kg</span>
            </div>
          </div>
          <div className="stat-hero-glass" style={{ cursor: 'pointer' }} onClick={!isEditingRate ? startEditingRate : undefined}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>Rate / Kg</span>
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.5 }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-row fade-in-up" style={{ animationDelay: '0.1s' }}>
        <button className="btn btn-primary" onClick={() => setCurrentTab('add')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Daily Milk
        </button>
        <button className="btn btn-whatsapp" onClick={handleShare}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
          Send Report
        </button>
      </div>

      {/* Month Progress Card */}
      <div className="card fade-in-up" style={{ animationDelay: '0.15s' }}>
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

      {/* Recent Entries */}
      <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h3 className="section-title">
            <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Recent Logs
          </h3>
          <button className="section-link" onClick={() => setCurrentTab('history')}>
            See All →
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {recentEntries.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🥛</span>
              <span className="empty-state-text">
                No deliveries recorded for this month yet.<br/>
                Tap <strong>Add Daily Milk</strong> to get started.
              </span>
            </div>
          ) : (
            recentEntries.map((entry, index) => {
              const dateObj = new Date(entry.date);
              const day = dateObj.toLocaleDateString('default', { day: 'numeric', weekday: 'short' });
              return (
                <div key={entry.id} className={`history-item fade-in stagger-${index + 1}`}>
                  <div style={{ textAlign: 'left' }}>
                    <div className="history-date">{day}</div>
                    {entry.note && <span className="history-note">{entry.note}</span>}
                  </div>
                  <div className="history-qty">
                    {entry.quantity} kg
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
