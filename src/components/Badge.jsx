import React from 'react';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const isNormal = status === 'Healing Normally' || status === 'Normal' || status === 'Good' || status === 'Recovering Well';
  const isPending = status === 'Pending Review' || status === 'Under Review';
  
  if (isPending) {
    return (
      <span className="badge badge-info">
        <Clock size={14} />
        {status}
      </span>
    );
  }

  return (
    <span className={`badge ${isNormal ? 'badge-healing' : 'badge-attention'}`}>
      {isNormal ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
      {status || 'Healing Normally'}
    </span>
  );
};

export default StatusBadge;
