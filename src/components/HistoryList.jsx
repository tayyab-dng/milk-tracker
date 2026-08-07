import React, { useState } from 'react';

export default function HistoryList({ 
  entries, 
  onDeleteEntry, 
  onUpdateEntry,
  settings, 
  currentMonth, 
  setCurrentMonth,
  monthlyRates,
  showToast
}) {
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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

  // Filter entries
  const filteredEntries = entries
    .filter(e => e.date.startsWith(currentMonth))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalKg = filteredEntries.reduce((acc, entry) => acc + parseFloat(entry.quantity), 0);
  const rate = monthlyRates[currentMonth] !== undefined ? monthlyRates[currentMonth] : settings.defaultRate;
  const totalBill = totalKg * rate;

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditQty(entry.quantity.toString());
    setEditNote(entry.note || '');
    setEditDate(entry.date);
    setDeleteConfirmId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id) => {
    const parsedQty = parseFloat(editQty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      showToast("Please enter a valid quantity.");
      return;
    }
    onUpdateEntry(id, {
      date: editDate,
      quantity: parsedQty,
      note: editNote.trim()
    });
    setEditingId(null);
    showToast("Entry updated successfully! ✏️");
  };

  const handleDelete = (id) => {
    onDeleteEntry(id);
    setDeleteConfirmId(null);
    showToast("Entry deleted. 🗑️");
  };

  const toggleDeleteConfirm = (id) => {
    setDeleteConfirmId(deleteConfirmId === id ? null : id);
    setEditingId(null);
  };

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

      {/* Mini Stats Bar */}
      <div className="mini-stats-bar fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="mini-stat">
          <div className="mini-stat-label">Month Total</div>
          <div className="mini-stat-value">{totalKg.toFixed(1)} kg</div>
        </div>
        <div className="mini-stat" style={{ textAlign: 'right' }}>
          <div className="mini-stat-label">Month Bill</div>
          <div className="mini-stat-value" style={{ color: 'var(--text-main)' }}>
            {settings.currency}{totalBill.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
      </div>

      {/* Entries Header */}
      <div className="section-header fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="section-title">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Logs ({filteredEntries.length})
        </h3>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">📋</span>
            <span className="empty-state-text">
              No logs found for this month.<br/>
              Use the <strong>Add</strong> button to log deliveries.
            </span>
          </div>
        </div>
      ) : (
        filteredEntries.map((entry, index) => {
          const isEditing = editingId === entry.id;
          const isDeleting = deleteConfirmId === entry.id;
          const dateObj = new Date(entry.date);
          const formattedDate = dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
          const staggerClass = index < 6 ? `fade-in stagger-${index + 1}` : 'fade-in';
          
          return (
            <div key={entry.id} className={`entry-card ${staggerClass}`}>
              {isEditing ? (
                /* Edit Mode */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Quantity (kg)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="form-control"
                        style={{ padding: '8px 10px', fontSize: '0.85rem', fontWeight: 'bold' }}
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Notes</label>
                    <input 
                      type="text" 
                      className="form-control"
                      style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Optional note"
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '2px' }}>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }} onClick={cancelEdit}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }} onClick={() => saveEdit(entry.id)}>
                      Save
                    </button>
                  </div>
                </div>
              ) : isDeleting ? (
                /* Delete Confirmation */
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--error)', fontWeight: 600 }}>
                    Delete this entry?
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: 'var(--radius-full)' }}
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      No
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: 'var(--radius-full)' }}
                      onClick={() => handleDelete(entry.id)}
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              ) : (
                /* Read Mode */
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div className="history-date">{formattedDate}</div>
                    {entry.note && <span className="history-note">{entry.note}</span>}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="history-qty">{entry.quantity} kg</div>
                    <div className="history-actions">
                      <button className="btn-icon" onClick={() => startEdit(entry)} title="Edit Entry">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button className="btn-icon delete" onClick={() => toggleDeleteConfirm(entry.id)} title="Delete Entry">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
