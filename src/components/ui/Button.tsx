import React from 'react';
import { cn } from '@/lib/fechas';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  cargando?: boolean;
  cargandoTexto?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  cargando = false,
  cargandoTexto,
  disabled,
  type = 'button',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out rounded-xl min-h-[44px] min-w-[44px] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-[0.98]',
    secondary:
      'bg-white text-slate-800 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-2xs active:scale-[0.98]',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-500/20 active:scale-[0.98]',
    outline:
      'border border-slate-200/90 bg-white/60 text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-base px-4 py-2 gap-2',
    lg: 'text-lg px-6 py-3 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {cargando ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>{cargandoTexto || 'Cargando...'}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};