'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus } from 'lucide-react';
import { classService } from '@/services/class.service';

export default function NewClassPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    className: '',
    sectionName: '',
    maxLimit: '',
    classTeacherId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const created = await classService.createClass({
        className: formData.className,
        sectionName: formData.sectionName,
        maxLimit: formData.maxLimit ? parseInt(formData.maxLimit) : undefined,
        classTeacherId: formData.classTeacherId || undefined,
      });

      router.push(created?.id ? `/dashboard/admin/class/${created.id}` : '/dashboard/admin/class');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create class');
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Class</h1>
          <p className="text-sm text-muted-foreground mt-1">Add a new class section to your school</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">Class Information</CardTitle>
          <CardDescription className="text-xs font-medium mt-1">
            Fill in the details to create a new class section
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Name */}
            <div className="space-y-2">
              <Label htmlFor="className" className="text-xs font-bold uppercase tracking-widest">
                Class Name *
              </Label>
              <Input
                id="className"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="e.g., Class 1, Class 10"
                className="rounded-xl h-10"
                required
              />
              <p className="text-xs text-muted-foreground">The grade/class name (e.g. Class 1)</p>
            </div>

            {/* Section Name */}
            <div className="space-y-2">
              <Label htmlFor="sectionName" className="text-xs font-bold uppercase tracking-widest">
                Section Name *
              </Label>
              <Input
                id="sectionName"
                value={formData.sectionName}
                onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                placeholder="e.g., A, B, C"
                className="rounded-xl h-10"
                required
              />
              <p className="text-xs text-muted-foreground">The section identifier (e.g. A)</p>
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
              <p className="text-xs text-muted-foreground">Maximum number of students allowed in this section</p>
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
            <div className="flex gap-3 justify-end pt-6 border-t border-border/50">
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
                disabled={isLoading}
                className="rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isLoading ? 'Creating...' : 'Create Class'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="rounded-2xl border-border shadow-sm bg-blue-50/50 border-blue-200/50">
        <CardContent className="p-6">
          <h3 className="font-bold text-foreground mb-2">Class Creation Guidelines</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Each record represents a unique class + section combination (e.g., Class 1 – A)</li>
            <li>✓ Max limit is the maximum number of students allowed in this section</li>
            <li>✓ Class Teacher ID is optional; you can assign one later from the Teachers section</li>
            <li>✓ The combination of Class Name + Section Name must be unique for your school</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

