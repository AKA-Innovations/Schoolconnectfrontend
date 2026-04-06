'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, GraduationCap, LayoutDashboard, Users, ShieldCheck, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeacherFilterParams } from '@/types/roles';

const ROLE_CHIPS = [
  { label: 'Principals',        key: 'isPrincipal',       icon: ShieldCheck },
  { label: 'Coordinators',      key: 'isCoordinator',     icon: Briefcase },
  { label: 'Subject Teachers',  key: 'isSubjectTeacher',  icon: GraduationCap },
] as const;

type Props = {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  filters: TeacherFilterParams;
  onFiltersChange: (f: TeacherFilterParams) => void;
  onClear: () => void;
};

export function TeacherFilterBar({ searchTerm, onSearchChange, filters, onFiltersChange, onClear }: Props) {
  const hasActive = !!(searchTerm || filters.subjectName || filters.className);

  return (
    <div className="bg-white/80 backdrop-blur-2xl border border-slate-100 rounded-[2.5rem] p-2 shadow-xl shadow-slate-200/40 space-y-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">

        {/* Search */}
        <div className="relative w-full lg:max-w-xs group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            placeholder="Search staff..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
          />
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-100" />

        {/* Text filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              placeholder="Filter by subject..."
              value={filters.subjectName || ''}
              onChange={e => onFiltersChange({ ...filters, subjectName: e.target.value || undefined })}
              className={cn(
                'h-10 pl-9 pr-4 bg-white border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all w-44',
                filters.subjectName ? 'border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600'
              )}
            />
          </div>
          <div className="relative group">
            <LayoutDashboard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
            <input
              placeholder="Filter by class..."
              value={filters.className || ''}
              onChange={e => onFiltersChange({ ...filters, className: e.target.value || undefined })}
              className={cn(
                'h-10 pl-9 pr-4 bg-white border rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500/20 transition-all w-44',
                filters.className ? 'border-purple-200 text-purple-700' : 'border-slate-200 text-slate-600'
              )}
            />
          </div>
        </div>

        {/* Role chips */}
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          {ROLE_CHIPS.map(role => {
            const isActive = !!filters[role.key as keyof TeacherFilterParams];
            return (
              <button
                key={role.key}
                onClick={() => onFiltersChange({ ...filters, [role.key]: !isActive })}
                className={cn(
                  'p-2.5 rounded-xl transition-all border',
                  isActive
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600'
                )}
                title={role.label}
              >
                <role.icon size={16} />
              </button>
            );
          })}
        </div>

        {/* Clear */}
        <AnimatePresence>
          {hasActive && (
            <motion.button
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-2 text-rose-500 font-bold text-[10px] uppercase hover:bg-rose-50 rounded-lg transition-colors"
            >
              <X size={14} /> Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
