import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export const ErrorState = ({
  title = 'Unable to load students',
  message = 'Please check your connection and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border border-rose-100 bg-rose-50/40 flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-rose-100/80 flex items-center justify-center text-rose-600 mb-3.5">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-600 max-w-sm mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={RefreshCw}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
