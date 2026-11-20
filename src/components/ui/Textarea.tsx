import React, { useId } from 'react';
import { cn } from '@/lib/fechas';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
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
          <label htmlFor={textareaId} className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight">
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
            'w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 text-sm transition-all duration-150 ease-out placeholder:text-slate-400 focus:outline-none resize-y shadow-2xs leading-relaxed',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-rose-950 bg-rose-50/20'
              : 'border-slate-200/90 hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
            className
          )}
          {...props}
        />
        {ayuda && !error && (
          <p id={ayudaId} className="text-xs text-slate-500 leading-normal">
            {ayuda}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs font-semibold text-rose-600 animate-fade-up">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';