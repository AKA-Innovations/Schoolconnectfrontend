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
}: Props<T>) {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-slate-50 bg-slate-50/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 ${col.key === columns[0].key ? 'pl-8' : ''} ${col.key === columns[columns.length - 1].key ? 'text-right pr-8' : ''} ${col.className ?? ''}`}
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
                  className="group transition-colors hover:bg-teal-50/30 border-b border-slate-50"
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
          <div className="flex items-center justify-between p-6 bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200"
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200"
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
