import React from 'react';
import { getInitials } from '../../utils/helpers';

export const Avatar = ({
  name = 'Student',
  size = 'md',
  className = '',
  src,
}) => {
  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border border-slate-200 ${sizeStyles[size] || sizeStyles.md} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium bg-slate-100 text-slate-700 border border-slate-200/80 shrink-0 select-none ${
        sizeStyles[size] || sizeStyles.md
      } ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
