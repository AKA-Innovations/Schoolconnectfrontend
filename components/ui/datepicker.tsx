'use client';

import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  buttonClassName?: string;
  align?: 'top' | 'bottom';
}

export function DatePicker({ value, onChange, className, placeholder = 'Select Date', buttonClassName, align = 'bottom' }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Internal state for calendar navigation
  const [currentDate, setCurrentDate] = React.useState(() => {
    if (value && isValid(new Date(value))) {
      return new Date(value);
    }
    return new Date();
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync internal navigation month when value changes from outside
  React.useEffect(() => {
    if (value && isValid(new Date(value))) {
      setCurrentDate(new Date(value));
    }
  }, [value]);

  // Close calendar popover on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper values for generating the calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  
  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  
  const totalSlots = 42; // 6 rows of 7 days
  const nextMonthDaysCount = totalSlots - (firstDayIndex + daysInMonth);

  const days: { dayNumber: number; isCurrentMonth: boolean; dateString: string }[] = [];

  // 1. Previous month padded days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDaysCount - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dayNumber: d, isCurrentMonth: false, dateString: dateStr });
  }

  // 2. Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ dayNumber: i, isCurrentMonth: true, dateString: dateStr });
  }

  // 3. Next month padded days
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ dayNumber: i, isCurrentMonth: false, dateString: dateStr });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (dateString: string) => {
    if (onChange) {
      onChange(dateString);
    }
    setIsOpen(false);
  };

  const handleToday = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (onChange) {
      onChange(todayStr);
    }
    setCurrentDate(new Date());
    setIsOpen(false);
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
    setIsOpen(false);
  };

  // Format the button label
  let displayLabel = placeholder;
  if (value) {
    const parsed = new Date(value);
    if (isValid(parsed)) {
      displayLabel = format(parsed, 'dd-MM-yyyy');
    }
  }

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full sm:w-44', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-left transition-all hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/20",
          !value && "text-muted-foreground",
          buttonClassName
        )}
      >
        <span>{displayLabel}</span>
        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute left-0 z-50 w-[280px] rounded-2xl border border-border bg-card p-3 shadow-xl animate-in fade-in zoom-in-95 duration-100",
          align === 'top' ? "bottom-full mb-1.5" : "top-full mt-1.5"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold tracking-wide">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent/10 text-muted-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent/10 text-muted-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-1">
            {weekDays.map((wd) => (
              <div key={wd} className="h-6 flex items-center justify-center">
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const isSelected = value === day.dateString;
              const isToday = format(new Date(), 'yyyy-MM-dd') === day.dateString;
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDate(day.dateString)}
                  className={cn(
                    "h-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all focus:outline-none",
                    !day.isCurrentMonth && "text-muted-foreground/30 font-normal",
                    day.isCurrentMonth && "text-foreground",
                    isToday && "border border-primary/40 bg-primary/5",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-bold shadow-md shadow-primary/20",
                    !isSelected && "hover:bg-accent/15"
                  )}
                >
                  {day.dayNumber}
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-border mt-3 pt-2 px-1">
            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] font-bold uppercase tracking-wider text-destructive hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
