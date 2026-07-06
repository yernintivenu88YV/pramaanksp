import React from 'react';

const variants = {
  primary: 'bg-[#17252A] text-[#FEFFFF] hover:bg-[#2B7A78] shadow-xs border border-[#17252A]',
  secondary: 'bg-[#DEF2F1] text-[#2B7A78] hover:bg-[#B3E3DE]/40 border border-[#B3E3DE]',
  ghost: 'text-[#2B7A78] hover:bg-[#DEF2F1] hover:text-[#17252A]',
  outline: 'bg-[#FEFFFF] text-[#2B7A78] border border-[#B3E3DE] hover:bg-[#DEF2F1]',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
};

const sizes = {
  sm: 'px-2.5 py-1 text-[11px]',
  md: 'px-3.5 py-1.5 text-xs',
  lg: 'px-5 py-2.5 text-xs',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

const statusStyles = {
  active: 'bg-[#DEF2F1] text-[#2B7A78] border border-[#3AAFA9]/30',
  escalated: 'bg-red-50 text-red-700 border border-red-200',
  review: 'bg-amber-50 text-amber-700 border border-amber-200',
  closed: 'bg-[#3AAFA9]/20 text-[#17252A] border border-[#3AAFA9]/40',
};

export function StatusChip({ status }) {
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-mono font-bold ${statusStyles[status] || statusStyles.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function Tag({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-lg border border-[#B3E3DE] bg-[#DEF2F1] px-2.5 py-0.5 text-xs font-medium text-[#2B7A78] ${className}`}>
      {children}
    </span>
  );
}
