'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Users, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StudentListItem } from '@/services/student.service';

type Props = {
  students: StudentListItem[];
  isLoading: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function StudentTableBody({ students, isLoading, hasFilters, onClearFilters }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
          <TableHead className="h-14 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 pl-8">Learner Identity</TableHead>
          <TableHead className="h-14 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Academic Node</TableHead>
          <TableHead className="h-14 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Contact Matrix</TableHead>
          <TableHead className="h-14 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</TableHead>
          <TableHead className="h-14 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 text-right pr-8">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={5} className="py-4 pl-8">
                <Skeleton className="h-10 w-full rounded-xl" />
              </TableCell>
            </TableRow>
          ))
        ) : students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-48 text-center">
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                <Users size={40} className="opacity-20" />
                <p className="text-sm font-semibold">No students found</p>
                {hasFilters && (
                  <button onClick={onClearFilters} className="text-xs font-bold text-indigo-500 hover:underline">Clear filters</button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ) : (
          students.map(student => {
            const academic = student.academics?.[0];
            const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
            return (
              <TableRow key={student.id} className="group hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-none">
                <TableCell className="py-5 pl-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 text-sm">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-none mb-1">{student.firstName} {student.lastName}</p>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">ID-{student.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {academic ? (
                    <div className="inline-flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">{academic.className}</span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        {academic.sectionName} · Roll {academic.rollNumber}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Mail size={12} className="text-slate-300" />{student.emailId}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      <Phone size={12} className="text-slate-300" />{student.mobileNumber}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    'rounded-full text-[10px] font-bold uppercase tracking-tight px-3 border-0 shadow-none',
                    student.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  )}>
                    <span className={cn('mr-1.5 inline-block w-1.5 h-1.5 rounded-full', student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400')} />
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Link href={`/dashboard/admin/student/${student.id}`}>
                    <Button variant="ghost" size="sm" className="rounded-xl h-9 px-4 text-xs font-bold opacity-0 group-hover:opacity-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all translate-x-2 group-hover:translate-x-0">
                      View <ArrowRight size={14} className="ml-1.5" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
