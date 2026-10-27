import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg';

  const sizeStyles = {
    xs: 'text-[11px] px-2 py-1 gap-1 h-7',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
  };

  const variantStyles = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 dark:bg-[#2FBF9F] dark:text-[#0D0D0D] dark:hover:bg-[#249B82] dark:active:bg-[#1f8771] focus-visible:ring-slate-900 dark:focus-visible:ring-[#2FBF9F] shadow-subtle',
    brand: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 dark:bg-[#2FBF9F] dark:text-[#0D0D0D] dark:hover:bg-[#249B82] focus-visible:ring-[#2FBF9F] shadow-subtle',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 dark:bg-[#191919] dark:text-[#F5F5F5] dark:hover:bg-[#202020] dark:border dark:border-[#292929] focus-visible:ring-slate-400',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 dark:border-[#292929] dark:bg-[#191919] dark:text-[#F5F5F5] dark:hover:bg-[#202020] dark:hover:border-[#383838] focus-visible:ring-slate-400 shadow-subtle',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/80 dark:text-[#A3A3A3] dark:hover:text-[#F5F5F5] dark:hover:bg-[#202020] focus-visible:ring-slate-400',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 dark:bg-[#EF4444] dark:hover:bg-[#dc2626] focus-visible:ring-rose-500 shadow-subtle',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
