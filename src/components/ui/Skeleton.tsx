import React from 'react';
import { cn } from '@/lib/fechas';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('animate-pulse rounded-xl bg-slate-200', className)} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
};