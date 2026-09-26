import React from 'react';
import { OperationStatus, OperationType } from '../../types';

interface StatusBadgeProps {
  status: OperationStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<OperationStatus, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-300',
    waiting: 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse',
    ready: 'bg-blue-50 text-blue-700 border-blue-300 font-semibold',
    done: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium',
    canceled: 'bg-rose-50 text-rose-700 border-rose-300 line-through',
  };

  const labels: Record<OperationStatus, string> = {
    draft: 'Draft',
    waiting: 'Waiting',
    ready: 'Ready',
    done: 'Done',
    canceled: 'Canceled',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'done'
            ? 'bg-emerald-500'
            : status === 'ready'
            ? 'bg-blue-500'
            : status === 'waiting'
            ? 'bg-amber-500'
            : status === 'canceled'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {labels[status]}
    </span>
  );
};

interface TypeBadgeProps {
  type: OperationType;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const configs: Record<OperationType, { label: string; class: string }> = {
    receipt: { label: 'Receipt (In)', class: 'bg-emerald-100 text-emerald-800' },
    delivery: { label: 'Delivery (Out)', class: 'bg-indigo-100 text-indigo-800' },
    internal: { label: 'Internal Transfer', class: 'bg-amber-100 text-amber-800' },
    adjustment: { label: 'Stock Adjustment', class: 'bg-purple-100 text-purple-800' },
  };

  const item = configs[type];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${item.class}`}>
      {item.label}
    </span>
  );
};
