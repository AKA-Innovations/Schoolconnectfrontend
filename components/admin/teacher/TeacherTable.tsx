'use client';

import React from 'react';
import { Eye, Edit, UserCheck, UserX, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Teacher } from '@/types/roles';
import { cn } from '@/lib/utils';

type Props = {
  teachers: Teacher[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onView: (t: Teacher) => void;
  onEdit: (t: Teacher) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onPageChange: (p: number) => void;
};

export function TeacherTable({ teachers, isLoading, page, totalPages, onView, onEdit, onToggleStatus, onPageChange }: Props) {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-slate-50 bg-slate-50/50">
              <TableHead className="py-5 pl-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">Identity</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Department</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Load</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Status</TableHead>
              <TableHead className="text-right pr-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="p-8">
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <Users size={48} />
                    <p className="font-bold">No Staff Found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : teachers.map(teacher => (
              <TableRow key={teacher.id} className="group transition-colors hover:bg-indigo-50/30 border-b border-slate-50">
                <TableCell className="py-5 pl-8">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-primary hover:bg-primary-hover flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                      {(teacher.firstName ?? '?').charAt(0)}{(teacher.lastName ?? '').charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{teacher.firstName} {teacher.lastName}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{teacher.employeeEmail}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">
                    {teacher.classes?.[0]?.subjectName || 'General'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {teacher.classes?.slice(0, 3).map((c, i) => (
                      <div key={i} className="h-7 px-2 flex items-center bg-white border border-slate-100 rounded-md text-[9px] font-bold text-slate-500 shadow-sm">
                        {c.className}-{c.sectionName}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter',
                    teacher.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                  )}>
                    <div className={cn('h-1 w-1 rounded-full', teacher.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400')} />
                    {teacher.status || 'Active'}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md" onClick={() => onView(teacher)}>
                      <Eye size={16} className="text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md" onClick={() => onEdit(teacher)}>
                      <Edit size={16} className="text-slate-400" />
                    </Button>
                    {teacher.status === 'active' ? (
                      <Button variant="ghost" size="icon" title="Deactivate" className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-400" onClick={() => onToggleStatus(teacher.id, false)}>
                        <UserX size={16} />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" title="Activate" className="h-9 w-9 rounded-xl hover:bg-emerald-50 text-emerald-500" onClick={() => onToggleStatus(teacher.id, true)}>
                        <UserCheck size={16} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-6 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-slate-200" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" className="rounded-xl border-slate-200" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
