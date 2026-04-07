'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useClasses, useDeleteClass } from '@/hooks/useClasses';
import { ClassSummaryDashboard } from './ClassSummaryDashboard';
import { Eye, Edit2, Trash2, Plus, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClassesOverview() {
  const [searchClass, setSearchClass] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isFetching, refetch } = useClasses({ page, limit: 10, className: searchClass || undefined });
  const deleteClassMutation = useDeleteClass();

  const classes = data?.items || [];
  const pagination = data?.pagination;
  const total = pagination?.totalPages || 1;

  const handleDelete = (classDtlsId: number) => {
    deleteClassMutation.mutate(classDtlsId, {
      onSuccess: () => {
        setDeleteConfirm(null);
        refetch();
      },
      onError: () => alert('Failed to delete class'),
    });
  };

  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Summary Dashboard */}
      <ClassSummaryDashboard />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Classes Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage all classes and their sections</p>
        </div>
        <Button className="rounded-xl bg-primary hover:bg-primary/90 gap-2" onClick={() => router.push('/dashboard/admin/class/new')}>
          <Plus className="h-4 w-4" />
          New Class
        </Button>
      </div>

      {/* Search and Controls */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by class name..."
                value={searchClass}
                onChange={(e) => {
                  setSearchClass(e.target.value);
                  setPage(1);
                }}
                className="pl-10 rounded-xl h-10"
              />
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

      {/* Classes Table */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">All Classes</CardTitle>
          <CardDescription className="text-xs font-medium mt-1">
            {pagination?.totalItemsCount || 0} classes found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-muted-foreground">No classes found</p>
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
                      Max Limit
                    </th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">
                      Class Teacher
                    </th>
                    <th className="px-8 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls.id} className="border-b border-border/30 hover:bg-muted/2 transition-colors">
                      <td className="px-8 py-4">
                        <div>
                          <p className="font-bold text-foreground">{cls.className}</p>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <Badge className="bg-blue-500/10 text-blue-600 border-0">
                          {cls.sectionName}
                        </Badge>
                      </td>
                      <td className="px-8 py-4">
                        <p className="font-semibold text-foreground">{cls.maxLimit ?? '-'}</p>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-sm text-muted-foreground font-mono text-xs">
                          {cls.classTeacherId ? cls.classTeacherId.slice(0, 8) + '…' : '-'}
                        </p>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg h-8 w-8 p-0"
                            title="View Details"
                            onClick={() => router.push(`/dashboard/admin/class/${cls.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg h-8 w-8 p-0"
                            title="Edit"
                            onClick={() => router.push(`/dashboard/admin/class/${cls.id}/edit`)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete"
                            onClick={() => setDeleteConfirm(cls.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
            {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <Card className="w-96 rounded-2xl">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <CardTitle className="text-lg font-bold tracking-tight">Delete Class</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete this class? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteClassMutation.isPending}
                  className="rounded-xl"
                >
                  {deleteClassMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
