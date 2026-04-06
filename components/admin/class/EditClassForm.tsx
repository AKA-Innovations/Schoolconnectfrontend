'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClass, useUpdateClass } from '@/hooks/useClasses';
import { ArrowLeft, Save } from 'lucide-react';

export function EditClassForm() {
  const params = useParams();
  const router = useRouter();
  const classDtlsId = parseInt(params?.id as string);

  const { data: classData, isLoading } = useClass(classDtlsId);
  const updateClassMutation = useUpdateClass(classDtlsId);

  const [formData, setFormData] = useState({
    className: '',
    sectionName: '',
    maxLimit: '',
    classTeacherId: '',
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        className: classData.className || '',
        sectionName: classData.sectionName || '',
        maxLimit: classData.maxLimit != null ? String(classData.maxLimit) : '',
        classTeacherId: classData.classTeacherId || '',
      });
    }
  }, [classData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateClassMutation.mutate(
      {
        className: formData.className || undefined,
        sectionName: formData.sectionName || undefined,
        maxLimit: formData.maxLimit ? parseInt(formData.maxLimit) : undefined,
        classTeacherId: formData.classTeacherId || undefined,
      },
      {
        onSuccess: () => {
          router.push(`/dashboard/admin/class/${classDtlsId}`);
        },
        onError: () => alert('Failed to update class'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/4" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-xl h-10 w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Class</h1>
          <p className="text-sm text-muted-foreground mt-1">Update class section details</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">Class Information</CardTitle>
          <CardDescription className="text-xs font-medium mt-1">
            Update the class section details below
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Name */}
            <div className="space-y-2">
              <Label htmlFor="className" className="text-xs font-bold uppercase tracking-widest">
                Class Name
              </Label>
              <Input
                id="className"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="e.g., Class 1, Class 10"
                className="rounded-xl h-10"
              />
            </div>

            {/* Section Name */}
            <div className="space-y-2">
              <Label htmlFor="sectionName" className="text-xs font-bold uppercase tracking-widest">
                Section Name
              </Label>
              <Input
                id="sectionName"
                value={formData.sectionName}
                onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                placeholder="e.g., A, B, C"
                className="rounded-xl h-10"
              />
            </div>

            {/* Max Limit */}
            <div className="space-y-2">
              <Label htmlFor="maxLimit" className="text-xs font-bold uppercase tracking-widest">
                Max Student Limit
              </Label>
              <Input
                id="maxLimit"
                type="number"
                value={formData.maxLimit}
                onChange={(e) => setFormData({ ...formData, maxLimit: e.target.value })}
                placeholder="e.g., 45"
                className="rounded-xl h-10"
                min="1"
              />
            </div>

            {/* Class Teacher ID */}
            <div className="space-y-2">
              <Label htmlFor="classTeacherId" className="text-xs font-bold uppercase tracking-widest">
                Class Teacher ID
              </Label>
              <Input
                id="classTeacherId"
                value={formData.classTeacherId}
                onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                placeholder="Teacher UUID (optional)"
                className="rounded-xl h-10"
              />
              <p className="text-xs text-muted-foreground">Optional: UUID of the teacher assigned as class teacher</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateClassMutation.isPending}
                className="rounded-xl"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateClassMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

