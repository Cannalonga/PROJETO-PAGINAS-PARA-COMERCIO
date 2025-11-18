import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ',
  };

  return (
    <div className={`border rounded-lg p-4 ${typeStyles[type]} animate-fade-in`}>
      <div className="flex items-start">
        <span className="mr-3 text-lg font-bold">{iconMap[type]}</span>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-lg hover:opacity-75 transition"
            aria-label="Fechar alerta"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
