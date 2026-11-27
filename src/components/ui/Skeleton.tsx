import React from 'react';
import { cn } from '@/lib/fechas';
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => <div aria-hidden="true" className={cn('motion-safe:animate-pulse rounded-lg bg-slate-200', className)} />;
export const CardSkeleton: React.FC = () => (
  <div className="card flex flex-col overflow-hidden" role="status">
    <span className="sr-only">Cargando objetos…</span>
    <Skeleton className="h-48 sm:h-52 w-full !rounded-none" />
    <div className="flex flex-1 flex-col gap-4 p-6">
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
      <div className="mt-auto flex justify-between border-t border-slate-100 pt-4"><Skeleton className="h-4 w-2/5" /><Skeleton className="h-4 w-1/3" /></div>
    </div>
  </div>
);
