'use client';

import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: string; // YYYY-MM-DDTHH:MM
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  buttonClassName?: string;
}

export function DateTimePicker({
  value,
  onChange,
  className,
  placeholder = 'Select Date & Time',
  buttonClassName,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse initial values
  const initialDate = React.useMemo(() => {
    if (value) {
      const parsed = new Date(value);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  }, [value]);

  const [currentMonth, setCurrentMonth] = React.useState(() => initialDate);
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    if (value) {
      const parts = value.split('T');
      return parts[0] || '';
    }
    return '';
  });

  const [selectedHour, setSelectedHour] = React.useState<string>(() => {
    if (value) {
      const parts = value.split('T');
      if (parts[1]) {
        const timeParts = parts[1].split(':');
        return timeParts[0] || '00';
      }
    }
    return '00';
  });

  const [selectedMinute, setSelectedMinute] = React.useState<string>(() => {
    if (value) {
      const parts = value.split('T');
      if (parts[1]) {
        const timeParts = parts[1].split(':');
        return timeParts[1] || '00';
      }
    }
    return '00';
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync internal state when outer value changes
  React.useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (isValid(parsed)) {
        setCurrentMonth(parsed);
        const parts = value.split('T');
        setSelectedDate(parts[0] || '');
        if (parts[1]) {
          const timeParts = parts[1].split(':');
          setSelectedHour(timeParts[0] || '00');
          setSelectedMinute(timeParts[1] || '00');
        }
      }
    } else {
      setSelectedDate('');
      setSelectedHour('00');
      setSelectedMinute('00');
    }
  }, [value]);

  // Handle click outside to close popover
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

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

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
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const updateDateTime = (newDate: string, hour: string, minute: string) => {
    if (!newDate) return;
    const finalValue = `${newDate}T${hour}:${minute}`;
    if (onChange) {
      onChange(finalValue);
    }
  };

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    updateDateTime(dateString, selectedHour, selectedMinute);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hr = e.target.value;
    setSelectedHour(hr);
    if (selectedDate) {
      updateDateTime(selectedDate, hr, selectedMinute);
    } else {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      setSelectedDate(todayStr);
      updateDateTime(todayStr, hr, selectedMinute);
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const min = e.target.value;
    setSelectedMinute(min);
    if (selectedDate) {
      updateDateTime(selectedDate, selectedHour, min);
    } else {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      setSelectedDate(todayStr);
      updateDateTime(todayStr, selectedHour, min);
    }
  };

  const handleToday = () => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const hr = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    setSelectedDate(todayStr);
    setSelectedHour(hr);
    setSelectedMinute(min);
    setCurrentMonth(now);
    updateDateTime(todayStr, hr, min);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate('');
    setSelectedHour('00');
    setSelectedMinute('00');
    if (onChange) {
      onChange('');
    }
    setIsOpen(false);
  };

  // Format button label
  let displayLabel = placeholder;
  if (value) {
    const parsed = new Date(value);
    if (isValid(parsed)) {
      displayLabel = format(parsed, 'dd-MM-yyyy HH:mm');
    }
  }

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
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
        <div className="absolute left-0 mt-1.5 w-[360px] rounded-2xl border border-border bg-card p-3 shadow-xl z-50 flex animate-in fade-in zoom-in-95 duration-100">
          {/* Calendar Panel */}
          <div className="flex-1 pr-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold tracking-wide">
                {format(currentMonth, 'MMMM yyyy')}
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
                const isSelected = selectedDate === day.dateString;
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

          {/* Time Panel */}
          <div className="w-[100px] border-l border-border pl-3 flex flex-col gap-3 justify-center">
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase justify-center">
              <Clock size={12} />
              <span>Time</span>
            </div>
            <div className="flex items-center gap-1 justify-center">
              <select
                value={selectedHour}
                onChange={handleHourChange}
                className="w-11 h-9 rounded-lg border border-border bg-card text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:bg-accent/10 transition-colors"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const h = String(i).padStart(2, '0');
                  return (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  );
                })}
              </select>
              <span className="text-xs font-bold text-muted-foreground">:</span>
              <select
                value={selectedMinute}
                onChange={handleMinuteChange}
                className="w-11 h-9 rounded-lg border border-border bg-card text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:bg-accent/10 transition-colors"
              >
                {Array.from({ length: 60 }, (_, i) => {
                  const m = String(i).padStart(2, '0');
                  return (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-auto w-full h-8 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
