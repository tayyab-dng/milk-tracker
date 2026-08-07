import React, { useState, useEffect } from 'react';

export default function AddEntry({ onAddEntry, settings, showToast, setCurrentTab }) {
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getTodayString());
  const [quantity, setQuantity] = useState(settings.defaultQuantity || '1.0');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  // Update quantity when settings update or component mounts
  useEffect(() => {
    if (settings.defaultQuantity) {
      setQuantity(settings.defaultQuantity.toString());
    }
  }, [settings.defaultQuantity]);

  const handleQuickSelect = (val) => {
    setQuantity(val.toString());
  };

  const adjustQuantity = (amount) => {
    const currentVal = parseFloat(quantity) || 0;
    const newVal = Math.max(0.1, currentVal + amount);
    setQuantity(newVal.toFixed(1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      showToast("Please enter a valid quantity of milk.");
      return;
    }

    onAddEntry({
      date,
      quantity: parsedQty,
      note: note.trim()
    });

    // Show success state
    setSaved(true);
    setNote('');
    showToast(`Logged ${parsedQty} kg for ${new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}! 🥛`);
    
    setTimeout(() => {
      setSaved(false);
      setCurrentTab('dashboard');
    }, 600);
  };

  const quickBtns = settings.quickQuantities || [0.5, 1.0, 1.5, 2.0];

  return (
    <div className="fade-in">
      <h2 className="page-title">Log Milk Delivery</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Date Selector */}
        <div className="form-group fade-in-up stagger-1">
          <label className="form-label" htmlFor="entry-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--primary)' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Date
          </label>
          <input 
            type="date" 
            id="entry-date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Quantity */}
        <div className="form-group fade-in-up stagger-2">
          <label className="form-label" htmlFor="entry-qty">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--primary)' }}>
              <path d="M12 2C12 2 6 10 6 14.5C6 17.8 8.7 21 12 21C15.3 21 18 17.8 18 14.5C18 10 12 2 12 2Z" />
            </svg>
            Quantity (kg)
          </label>
          
          {/* Circular Quantity Display */}
          <div className="qty-display">
            <button 
              type="button" 
              className="qty-adjust-btn"
              onClick={() => adjustQuantity(-0.5)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            
            <div className="qty-value-circle" onClick={() => {
              const input = document.getElementById('entry-qty');
              if (input) input.focus();
            }}>
              <span className="qty-num">{parseFloat(quantity).toFixed(1)}</span>
              <span className="qty-unit">kg</span>
            </div>
            
            <button 
              type="button" 
              className="qty-adjust-btn"
              onClick={() => adjustQuantity(0.5)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Hidden native input for form validation */}
          <input 
            type="number" 
            step="0.1" 
            min="0.1"
            id="entry-qty"
            className="qty-hidden-input" 
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            tabIndex={-1}
          />

          {/* Quick presets */}
          <div className="quick-add-grid">
            {quickBtns.map((val) => (
              <button
                key={val}
                type="button"
                className={`btn-quick ${parseFloat(quantity) === val ? 'active' : ''}`}
                onClick={() => handleQuickSelect(val)}
              >
                {val} kg
              </button>
            ))}
          </div>
        </div>

        {/* Optional Notes */}
        <div className="form-group fade-in-up stagger-3">
          <label className="form-label" htmlFor="entry-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--primary)' }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Notes (Optional)
          </label>
          <input 
            type="text" 
            id="entry-note"
            className="form-control" 
            placeholder="e.g. morning, afternoon, extra curd..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength="40"
          />
        </div>

        <button 
          type="submit" 
          className={`btn ${saved ? 'btn-success' : 'btn-primary'} fade-in-up stagger-4`}
          style={{ width: '100%', marginTop: '8px', padding: '15px', fontSize: '1rem' }}
          disabled={saved}
        >
          {saved ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Saved!
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save Log
            </>
          )}
        </button>
      </form>
    </div>
  );
}
