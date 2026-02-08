import React, { useEffect } from 'react';
import { Info, X } from 'lucide-react';
import './InfoModal.css';

function InfoModal({ isOpen, onClose, title, message, details }) {
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

  if (!isOpen) return null;

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="info-modal-header">
          <div className="info-modal-title">
            <Info size={24} className="info-icon" />
            <h2>{title}</h2>
          </div>
          <button className="info-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="info-modal-content">
          <p className="info-modal-message">{message}</p>

          {details && details.length > 0 && (
            <div className="info-modal-details">
              <h4>How to earn rewards:</h4>
              <ul>
                {details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="info-modal-footer">
          <button className="info-modal-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;
