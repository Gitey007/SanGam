import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  disabled = false,
  required = false,
  className = '',
  leftIcon: LeftIcon,
  rightElement: RightElement,
  ...props
}, ref) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3 pointer-events-none text-slate-400">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            LeftIcon ? 'pl-9' : ''
          } ${RightElement ? 'pr-10' : ''} ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
          {...props}
        />

        {RightElement && (
          <div className="absolute right-3 flex items-center">
            {RightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-600 font-normal">{error}</p>
      )}

      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
