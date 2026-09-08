import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  onClick,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-md border transition-colors';

  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 leading-tight gap-1',
    md: 'text-xs px-2 py-0.5 leading-normal gap-1.5',
    lg: 'text-sm px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    neutral: 'bg-slate-100/80 border-slate-200/80 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700',
    brand: 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-950/70 dark:border-brand-800 dark:text-brand-300',
    outline: 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-300',
    amber: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/70 dark:border-amber-800 dark:text-amber-300',
    rose: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/70 dark:border-rose-800 dark:text-rose-300',
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.neutral} ${
        onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''
      } ${className}`}
    >
      {children}
    </Component>
  );
};

export default Badge;
