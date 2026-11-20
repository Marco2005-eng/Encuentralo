import React from 'react';
import { cn } from '@/lib/fechas';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('animate-pulse rounded-xl bg-slate-200/80', className)} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card flex flex-col overflow-hidden border border-slate-200/80 bg-white">
      <Skeleton className="h-48 sm:h-52 w-full rounded-none" />
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
};