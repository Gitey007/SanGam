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
    neutral: 'bg-slate-100/80 border-slate-200/80 text-slate-700 dark:bg-[#191919] dark:border-[#292929] dark:text-[#D4D4D4] hover:bg-slate-200/60 dark:hover:bg-[#202020]',
    brand: 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-[#2FBF9F]/10 dark:border-[#2FBF9F]/30 dark:text-[#2FBF9F]',
    outline: 'bg-transparent border-slate-200 dark:border-[#292929] text-slate-600 dark:text-[#A3A3A3]',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-[#22C55E]/10 dark:border-[#22C55E]/30 dark:text-[#22C55E]',
    amber: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-[#F59E0B]/10 dark:border-[#F59E0B]/30 dark:text-[#F59E0B]',
    rose: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-[#EF4444]/10 dark:border-[#EF4444]/30 dark:text-[#EF4444]',
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
