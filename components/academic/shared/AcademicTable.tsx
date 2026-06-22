'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T, index: number) => React.ReactNode;
}

interface Props<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading: boolean;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  rowKey: (item: T) => string | number;
  onRowClick?: (item: T) => void;
}

function AcademicTableInner<T>({
  columns,
  data,
  isLoading,
  emptyIcon,
  emptyMessage = 'No records found',
  page = 1,
  totalPages = 1,
  onPageChange,
  rowKey,
  onRowClick,
}: Props<T>) {
  return (
    <Card className="rounded-[2.5rem] border border-border/40 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/40 bg-slate-50/70 dark:bg-white/5">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground ${col.key === columns[0].key ? 'pl-8' : ''} ${col.key === columns[columns.length - 1].key ? 'text-right pr-8' : ''} ${col.className ?? ''}`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columns.length} className="p-8">
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    {emptyIcon ?? <Inbox size={48} />}
                    <p className="font-bold">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, idx) => (
                <TableRow
                  key={rowKey(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "group transition-all duration-300 border-b border-border/40 hover:-translate-y-0.5 hover:shadow-sm relative hover:z-10",
                    onRowClick 
                      ? "cursor-pointer hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 hover:shadow-[inset_4px_0_0_0_#10b981,0_4px_10px_-4px_rgba(0,0,0,0.08)]" 
                      : "hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)]",
                    idx % 2 === 1 ? "bg-slate-50/[0.15] dark:bg-white/[0.01]" : ""
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`${col.key === columns[0].key ? 'py-5 pl-8' : ''} ${col.key === columns[columns.length - 1].key ? 'text-right pr-8' : ''} ${col.className ?? ''}`}
                    >
                      {col.render(item, idx)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-3 px-6 bg-slate-50/40 dark:bg-white/[0.02] border-t border-border/40">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-slate-200/80 text-xs h-8 px-3 font-bold text-slate-600 hover:bg-slate-50"
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-slate-200/80 text-xs h-8 px-3 font-bold text-slate-600 hover:bg-slate-50"
                disabled={page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const AcademicTable = React.memo(AcademicTableInner) as typeof AcademicTableInner;
