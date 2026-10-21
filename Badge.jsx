import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const isNormal = status === 'Healing Normally' || status === 'Normal';
  
  return (
    <span className={`badge ${isNormal ? 'badge-normal' : 'badge-attention'}`}>
      {isNormal ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
      {status || 'Healing Normally'}
    </span>
  );
};

export default StatusBadge;
