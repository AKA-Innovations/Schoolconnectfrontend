'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, GraduationCap, BookOpen, Loader2, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  const { schoolId, role } = useAuthStore();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading, error } = useGlobalSearch(debouncedQuery, schoolId, role);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'student': return <GraduationCap size={16} className="text-blue-500" />;
      case 'teacher': return <User size={16} className="text-teal-500" />;
      case 'class': return <BookOpen size={16} className="text-purple-500" />;
      case 'subject': return <BookOpen size={16} className="text-orange-500" />;
      default: return <Search size={16} />;
    }
  };

  return (
    <div ref={containerRef} className="hidden sm:flex items-center flex-1 max-w-md group ml-3 lg:ml-0 relative">
      <div className="relative w-full">
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
            isLoading ? "text-primary animate-pulse" : "text-muted-foreground"
          )}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          placeholder="Search students, teachers, classes, subjects..."
          style={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            fontSize: '0.875rem',
          }}
          className="w-full pl-10 pr-10 py-2 rounded-lg transition-all focus:ring focus:ring-primary/10 outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (debouncedQuery.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
                <Loader2 size={24} className="animate-spin text-primary" />
                <p className="text-xs font-medium">Searching records...</p>
              </div>
            ) : error ? (
              <div className="py-4 px-3 text-center text-rose-500 text-xs font-medium">
                Search failed. Please try again.
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result.href)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-background transition-colors">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">{result.name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{result.subtitle || result.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Search size={20} className="text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground">No results found</p>
                <p className="text-xs text-muted-foreground mt-1">Try searching for something else</p>
              </div>
            )}
          </div>
          
          <div className="bg-muted/50 px-4 py-2 border-t border-border flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Global Search</span>
            <span className="text-[10px] text-muted-foreground/40 font-medium">Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
