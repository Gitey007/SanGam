import React from 'react';
import { AlertTriangle, RefreshCw, Server, Sparkles, Loader2 } from 'lucide-react';
import Button from './Button';

export const ErrorState = ({
  title = 'Unable to load content',
  message = 'Please check your connection and try again.',
  onRetry,
  className = '',
  isWakingUp,
}) => {
  // Detect if error represents a backend cold-start / waking up state
  const isServerWaking =
    isWakingUp === true ||
    (typeof message === 'string' &&
      (message.toLowerCase().includes('waking up') ||
        message.toLowerCase().includes('starting up') ||
        message.toLowerCase().includes('taking longer than expected') ||
        message.toLowerCase().includes('free hosting'))) ||
    (typeof title === 'string' && title.toLowerCase().includes('waking up'));

  if (isServerWaking) {
    return (
      <div
        className={`text-center py-10 px-6 rounded-2xl border border-indigo-100/80 dark:border-indigo-900/60 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 shadow-subtle flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
      >
        {/* Animated Server Pulse Indicator */}
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100/80 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
            <Server className="w-6 h-6 animate-pulse text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 text-[11px] font-medium text-amber-800 dark:text-amber-300 mb-2.5">
          <Loader2 className="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400" />
          <span>Server is waking up</span>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">
          SanGam server is waking up
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mb-5 leading-relaxed">
          The backend is starting. This can take up to 1–2 minutes after a period of inactivity on the free hosting plan.
        </p>

        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            leftIcon={RefreshCw}
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`text-center py-10 px-6 rounded-xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/30 flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100/80 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3.5">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mb-5 leading-relaxed">{message}</p>
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

