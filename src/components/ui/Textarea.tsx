import React, { useId } from 'react';
import { cn } from '@/lib/fechas';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  ayuda?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, ayuda, className, id, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const ayudaId = `${textareaId}-ayuda`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-semibold text-slate-700">
            {label}
            {props.required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : ayuda ? ayudaId : undefined}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-y',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-950'
              : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100',
            className
          )}
          {...props}
        />
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
Textarea.displayName = 'Textarea';