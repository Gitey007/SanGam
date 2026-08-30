import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  error,
  hint,
  disabled = false,
  required = false,
  className = '',
  placeholder,
  ...props
}, ref) => {
  const selectId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none rounded-lg border bg-white pl-3 pr-9 py-2 text-sm text-slate-900 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
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

Select.displayName = 'Select';

export default Select;
