import React from 'react';
import { Link } from 'react-router-dom';
import { Laptop, FileText, Shirt, Watch, NotebookPen, KeyRound, Backpack, Package, type LucideIcon } from 'lucide-react';
import type { Categoria } from '@/types/models';

const styles: Record<Categoria, { icon: LucideIcon; color: string }> = {
  electronicos: { icon: Laptop, color: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100' },
  documentos: { icon: FileText, color: 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100' },
  ropa: { icon: Shirt, color: 'bg-violet-50 text-violet-900 border-violet-200 hover:bg-violet-100' },
  accesorios: { icon: Watch, color: 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200 hover:bg-fuchsia-100' },
  utiles: { icon: NotebookPen, color: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100' },
  llaves: { icon: KeyRound, color: 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100' },
  mochilas: { icon: Backpack, color: 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100' },
  otros: { icon: Package, color: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200' },
};
export const CategoriaAcceso: React.FC<{ categoria: Categoria; label: string }> = ({ categoria, label }) => {
  const { icon: Icon, color } = styles[categoria];
  return <Link to={'/objetos?categoria=' + categoria} className={'category-access flex min-h-[120px] flex-col items-center justify-center gap-4 rounded-2xl border p-4 shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:shadow-md active:scale-[0.98] motion-reduce:transform-none ' + color}>
    <Icon className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
    <span className="text-sm font-semibold">{label}</span>
  </Link>;
};
