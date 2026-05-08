'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface Props {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  onClear: () => void;
  hasActiveFilters: boolean;
  children?: React.ReactNode;
}

export const AcademicFilterBar = React.memo(function AcademicFilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onClear,
  hasActiveFilters,
  children,
}: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-2xl border border-slate-100 rounded-[2.5rem] p-2 shadow-xl shadow-slate-200/40 space-y-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
          <input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-teal-500/5 transition-all"
          />
        </div>

        {children && (
          <>
            <div className="hidden lg:block w-px h-8 bg-slate-100" />
            <div className="flex flex-wrap items-center gap-4">{children}</div>
          </>
        )}

        {/* Clear */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-2 text-rose-500 font-bold text-[10px] uppercase hover:bg-rose-50 rounded-lg transition-colors ml-auto"
            >
              <X size={14} /> Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
