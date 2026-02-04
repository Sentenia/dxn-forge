import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

function ConfirmModal({ isOpen, onClose, onConfirm, title, warnings, details, confirmWord = 'LOCK' }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  // Reset input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError('');
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    if (inputValue === confirmWord) {
      onConfirm();
      onClose();
    } else {
      setError(`You must type "${confirmWord}" to confirm`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <AlertTriangle size={24} className="warning-icon" />
            <h2>{title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Warnings */}
          <div className="modal-warnings">
            <h3>CRITICAL WARNINGS:</h3>
            <ul>
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>

          {/* Details */}
          {details && (
            <div className="modal-details">
              {details.map((detail, index) => (
                <div key={index} className="detail-row">
                  <span className="detail-label">{detail.label}:</span>
                  <span className="detail-value">{detail.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Confirmation Input */}
          <div className="modal-confirm-section">
            <p>Type "<strong>{confirmWord}</strong>" to confirm you understand this is permanent.</p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder={`Type ${confirmWord} here`}
              className={error ? 'input-error' : ''}
              autoFocus
            />
            {error && <span className="error-message">{error}</span>}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="modal-btn confirm" 
            onClick={handleConfirm}
            disabled={inputValue !== confirmWord}
          >
            🔐 Confirm Lock
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;