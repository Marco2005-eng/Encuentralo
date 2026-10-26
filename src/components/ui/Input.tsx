import React, { useId } from 'react';
import { cn } from '@/lib/fechas';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  ayuda?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ayuda, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const ayudaId = `${inputId}-ayuda`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
            {label}
            {props.required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : ayuda ? ayudaId : undefined}
            className={cn(
              'w-full min-h-[44px] px-3.5 py-2 rounded-xl border bg-white text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2',
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-950'
                : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100',
              className
            )}
            {...props}
          />
        </div>
        {ayuda && !error && (
          <p id={ayudaId} className="text-xs text-slate-500">
            {ayuda}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs font-medium text-rose-600 animate-fade-up">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';