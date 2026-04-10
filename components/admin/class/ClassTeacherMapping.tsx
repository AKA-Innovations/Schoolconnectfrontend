'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useClassTeachers } from '@/hooks/useClasses';
import { Phone, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClassTeacherMapping() {
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useClassTeachers({
    page,
    limit: 10,
    teacherName: searchTeacher || undefined,
    className: searchClass || undefined,
  });

  const teacherMappings = data?.items || [];
  const pagination = data?.pagination;
  const total = pagination?.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Class Teacher Mapping</h2>
        <p className="text-sm text-muted-foreground mt-1">View teacher assignments across classes and sections</p>
      </div>

      {/* Search Controls */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Search by Class
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Class name..."
                  value={searchClass}
                  onChange={(e) => {
                    setSearchClass(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 rounded-xl h-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Search by Teacher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Teacher name..."
                  value={searchTeacher}
                  onChange={(e) => {
                    setSearchTeacher(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 rounded-xl h-10"
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="rounded-xl h-10 w-10"
              title="Refresh"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Mappings Table */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">Teacher Assignments</CardTitle>
          <CardDescription className="text-xs font-medium mt-1">
            {pagination?.totalItemsCount || 0} assigments found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Loading assignments...</p>
            </div>
          ) : teacherMappings.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-muted-foreground">No teacher assignments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/5">
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">
                      Class
                    </th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">
                      Section
                    </th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">
                      Teacher Name
                    </th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">
                      Mobile
                    </th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">
                      Max Limit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teacherMappings.map((mapping, idx) => (
                    <tr key={idx} className="border-b border-border/30 hover:bg-muted/2 transition-colors">
                      <td className="px-8 py-4">
                        <Badge className="bg-blue-500/10 text-blue-600 border-0">{mapping.className}</Badge>
                      </td>
                      <td className="px-8 py-4">
                        <Badge className="bg-purple-500/10 text-purple-600 border-0">{mapping.sectionName}</Badge>
                      </td>
                      <td className="px-8 py-4 font-semibold">{mapping.teacherName ?? '-'}</td>
                      <td className="px-8 py-4">
                        <div className="space-y-1">
                          {mapping.teacherMobile && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {mapping.teacherMobile}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm text-foreground">{mapping.maxLimit ?? '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(total, 5) }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
                className="rounded-lg w-8 h-8 p-0"
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(total, page + 1))}
            disabled={page === total}
            className="rounded-lg"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
