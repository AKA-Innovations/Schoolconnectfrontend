'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExamTypes } from '@/services/exam/queries';
import { useCreateExamType, useUpdateExamType, useDeleteExamType } from '@/services/exam/mutations';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, Trash2, Edit2, Check, X, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function ExamTypesManager() {
  const queryClient = useQueryClient();
  const { data: examTypes = [], isLoading, isFetching, refetch } = useExamTypes();
  const createMutation = useCreateExamType();
  const updateMutation = useUpdateExamType();
  const deleteMutation = useDeleteExamType();

  const [searchTerm, setSearchTerm] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    try {
      await createMutation.mutateAsync({ name: newTypeName.trim() });
      setNewTypeName('');
      toast.success('Exam Type created successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create Exam Type');
    }
  };

  const handleStartEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingName.trim()) return;

    try {
      await updateMutation.mutateAsync({ id, data: { name: editingName.trim() } });
      setEditingId(null);
      toast.success('Exam Type updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update Exam Type');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exam type?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Exam Type deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete Exam Type');
    }
  };

  const typesArray = Array.isArray(examTypes) 
    ? examTypes 
    : (examTypes as any)?.items || [];

  const filteredTypes = typesArray.filter((type: any) =>
    (type?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Exam Types
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure default and custom categories for school examinations (e.g., UNIT_TEST, ANNUAL).
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          className="rounded-xl h-10 w-10 hover:bg-muted"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Form */}
        <Card className="rounded-2xl border border-border/80 shadow-sm bg-card h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Create Exam Type</CardTitle>
            <CardDescription className="text-xs">Add a new exam type category.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="typeName" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Exam Type Name
                </Label>
                <Input
                  id="typeName"
                  placeholder="e.g. MID_TERM, PRACTICE_TEST"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-primary hover:bg-primary/90"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Type'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: List of Exam Types */}
        <Card className="rounded-2xl border border-border/80 shadow-sm bg-card lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50 flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold">Configured Exam Types</CardTitle>
              <CardDescription className="text-xs">{filteredTypes.length} types available</CardDescription>
            </div>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/75" />
              <Input
                placeholder="Search exam types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 h-9 rounded-xl text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground">Loading exam types...</div>
            ) : filteredTypes.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No exam types found. Add one on the left.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredTypes.map((type: any) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-4 px-6 hover:bg-muted/10 transition-colors"
                  >
                    {editingId === type.id ? (
                      <div className="flex items-center gap-3 w-full">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-9 rounded-lg flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveEdit(type.id)}
                          className="rounded-lg h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg h-9 w-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-semibold text-sm text-foreground">{type.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleStartEdit(type.id, type.name)}
                            className="rounded-lg h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(type.id)}
                            className="rounded-lg h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
