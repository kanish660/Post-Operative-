import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

/**
 * MedicalDisclaimer component
 * Props:
 *  - compact: boolean — show compact inline version
 */
const MedicalDisclaimer = ({ compact = false, variant = '' }) => {
  const isCompact = compact || variant === 'compact';
  if (isCompact) {
    return (
      <div className="medical-disclaimer-banner compact">
        <Info size={16} style={{ flexShrink: 0, color: '#92400e' }} />
        <span>
          <strong>Academic Prototype:</strong> AI results are supportive only. A qualified healthcare professional must make all final medical decisions.
        </span>
      </div>
    );
  }

  return (
    <div className="medical-disclaimer-banner">
      <AlertTriangle size={20} style={{ flexShrink: 0, color: '#92400e' }} />
      <div>
        <strong>⚕️ ACADEMIC PROTOTYPE NOTICE:</strong> This platform is a college mini-project for remote recovery tracking and prototype AI wound evaluation. It does <strong>NOT</strong> provide certified medical diagnosis or treatment. All AI outputs are experimental supportive assessments only. Always consult a qualified healthcare professional.
      </div>
    </div>
  );
};

export default MedicalDisclaimer;
