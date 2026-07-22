import React from 'react';

const variants = {
  primary: 'bg-pramaan-primary text-pramaan-bg hover:bg-pramaan-secondary',
  secondary: 'bg-pramaan-primary/12 text-pramaan-secondary hover:bg-pramaan-primary/20',
  ghost: 'text-pramaan-text-secondary hover:bg-pramaan-elevated hover:text-pramaan-text',
  danger: 'bg-pramaan-critical/12 text-pramaan-critical hover:bg-pramaan-critical/20',
};

const sizes = {
  sm: 'px-2.5 py-1 text-[11px]',
  md: 'px-3.5 py-1.5 text-[12px]',
  lg: 'px-5 py-2 text-[13px]',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

const statusStyles = {
  active: 'bg-pramaan-primary/12 text-pramaan-secondary',
  escalated: 'bg-pramaan-critical/12 text-pramaan-critical',
  review: 'bg-pramaan-warning/12 text-pramaan-warning',
  closed: 'bg-pramaan-success/12 text-pramaan-success',
};

export function StatusChip({ status }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 ${statusStyles[status] || statusStyles.active}`} style={{ fontSize: 11, fontWeight: 600 }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function Tag({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-md border border-pramaan-border bg-pramaan-elevated px-2 py-0.5 text-pramaan-text-secondary ${className}`} style={{ fontSize: 11 }}>
      {children}
    </span>
  );
}
