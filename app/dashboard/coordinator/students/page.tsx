'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClassSectionLists } from '@/hooks/useClasses';
import { useStudentList } from '@/hooks/useStudents';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, Search, ArrowRight } from 'lucide-react';

export default function CoordinatorStudentsPage() {
  const user = useAuthStore((s) => s.user);
  const coordinatorClasses = user?.coordinatorClasses ?? [];

  const { data: allClassSections = [] } = useClassSectionLists();
  // Normalize coordinator classes to strings for filtering
  const coordClassNames = useMemo(() => 
    coordinatorClasses.map(c => String(typeof c === 'object' ? c.className : c)).filter(Boolean),
    [coordinatorClasses]
  );

  const classSections = useMemo(
    () => coordClassNames.length > 0
      ? allClassSections.filter((cs) => coordClassNames.includes(String(cs.className)))
      : allClassSections,
    [allClassSections, coordClassNames],
  );

  const [selectedId, setSelectedId] = useState<number>(0);
  const [search, setSearch] = useState('');
  const selectedSection = classSections.find((cs) => cs.id === selectedId);

  // Fetch students for the selected class-section (or first class when none selected)
  const filterId = selectedId || classSections[0]?.id;

  const { data: studentsData, isLoading } = useStudentList({
    classSectionId: filterId,
    limit: 500,
  });
  const students = studentsData?.items ?? [];

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter((s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.mobileNumber?.includes(q) ||
      s.academics?.[0]?.rollNumber?.toLowerCase().includes(q),
    );
  }, [students, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Students</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {coordClassNames.length > 0
                ? `Students in: ${coordClassNames.join(', ')}`
                : 'All students'}
            </p>
          </div>
        </div>
        <select value={selectedId || ''} onChange={(e) => setSelectedId(Number(e.target.value))}
          className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring w-52">
          <option value="">All sections</option>
          {classSections.map((cs) => (
            <option key={cs.id} value={cs.id}>{cs.className} — {cs.sectionName}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, roll number, or phone..." className="pl-9 rounded-xl" />
        </div>
        <Badge variant="secondary" className="rounded-lg shrink-0">{filtered.length} students</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <Card className="erp-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/10">
                    {['#', 'Roll No', 'Name', 'Class', 'Gender', 'Phone', 'Status', ''].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">No students found</td></tr>
                  ) : filtered.map((s, i) => (
                    <tr key={s.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-4 text-sm font-mono">{s.academics?.[0]?.rollNumber ?? '—'}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-sm">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-muted-foreground">{s.emailId}</div>
                      </td>
                      <td className="py-3 px-4">
                        {s.academics?.[0] ? (
                          <Badge variant="secondary" className="rounded-lg text-[10px]">
                            {s.academics[0].className} — {s.academics[0].sectionName}
                          </Badge>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{s.gender}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{s.mobileNumber}</td>
                      <td className="py-3 px-4">
                        <Badge className={`text-[9px] border-0 rounded-md ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button asChild variant="ghost" size="sm" className="rounded-lg text-xs h-7">
                          <Link href={`/dashboard/coordinator/students/${s.id}`}>
                            Profile <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
