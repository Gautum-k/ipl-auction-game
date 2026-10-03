import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const styles = {
    success: 'bg-emerald-950 border-emerald-800 text-emerald-200',
    error: 'bg-rose-950 border-rose-800 text-rose-200',
    info: 'bg-slate-900 border-slate-800 text-slate-200',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  return (
    <div
      className={`fixed top-16 right-4 z-50 max-w-sm border p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-top duration-200 ${styles[type]}`}
    >
      <div className="flex items-center gap-2">
        {icons[type]}
        <span className="text-xs font-semibold">{message}</span>
      </div>
      <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
