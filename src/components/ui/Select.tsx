import React, { useId } from 'react';
import { cn } from '@/lib/fechas';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  ayuda?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, ayuda, options, className, id, 'aria-describedby': describedBy, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const ayudaId = `${selectId}-ayuda`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-slate-700">
            {label}
            {props.required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={[describedBy, ayuda ? ayudaId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
          className={cn(
            'w-full min-h-[44px] px-3.5 py-2 rounded-xl border bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 cursor-pointer',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {ayuda && (
          <p id={ayudaId} className="text-sm text-slate-500">
            {ayuda}
          </p>
        )}
        {error && (
          <p role="alert" id={errorId} className="text-sm font-medium text-rose-600 animate-fade-up">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';