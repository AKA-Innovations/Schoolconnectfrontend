'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, BookOpen, Fingerprint } from 'lucide-react';
import { useSchoolClasses, useSchoolSections } from '@/hooks/useClasses';
import { classService } from '@/services/class.service';
import { teacherService } from '@/services/teacher.service';
import { TeacherSelectDropdown } from '@/components/admin/class/TeacherSelectDropdown';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { CURRENT_SESSION } from '@/lib/constants';

const classSchema = z.object({
  className: z.string().min(1, 'Class name is required'),
  sectionName: z.string().min(1, 'Section name is required'),
  maxLimit: z.string().optional(),
  classTeacherId: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classSchema>;

function FG({ label, children, required, error }: { label: string; children: React.ReactNode; required?: boolean; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive font-semibold mt-1">{error}</p>}
    </div>
  );
}

export default function NewClassPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: { classTeacherId: '', className: '', sectionName: '' },
  });

  const selectedClassName = watch('className');
  const { data: schoolClasses = [] } = useSchoolClasses();
  
  // Find the selected class ID to fetch its sections
  const selectedClass = schoolClasses.find(c => c.className === selectedClassName);
  const { data: schoolSections = [] } = useSchoolSections(selectedClass?.id);

  const onSubmit = async (data: ClassFormValues) => {
    setIsLoading(true);

    try {
      const selectedSection = schoolSections.find(s => s.sectionName === data.sectionName);
      if (!selectedSection) {
        toast.error('Selected section not found in school structure');
        setIsLoading(false);
        return;
      }

      const created = await classService.createClass({
        session: CURRENT_SESSION,
        classSectionsId: selectedSection.id,
        maxLimit: data.maxLimit ? parseInt(data.maxLimit) : undefined,
        classTeacherId: data.classTeacherId || undefined,
      });

      // If a teacher was assigned, also flip their isClassTeacher flag
      if (data.classTeacherId) {
        await teacherService.updateTeacherDetails(data.classTeacherId, { isClassTeacher: true });
      }

      // Invalidate react-query cache to update dashboard stats immediately
      queryClient.invalidateQueries({ queryKey: ['classes'] });

      toast.success(`Class ${data.className}-${data.sectionName} mapping created`);
      router.push(created?.id ? `/dashboard/admin/class/${created.id}` : '/dashboard/admin/class');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create class');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => router.back()}
          className="rounded-xl h-10 w-10 border border-border/50 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create Class Mapping</h2>
          <p className="text-sm text-muted-foreground mt-1">Map a master class and section to create a functional unit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="erp-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">Mapping Information</CardTitle>
                <CardDescription className="text-xs font-medium opacity-70 mt-0.5">Select from the institution's master structure</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <FG label="Class (Grade)" required error={errors.className?.message}>
                <select 
                  {...register('className')}
                  onChange={(e) => {
                    register('className').onChange(e);
                    setValue('sectionName', ''); // Reset section when class changes
                  }}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  <option value="">Select Class</option>
                  {schoolClasses.map(c => (
                    <option key={c.id} value={c.className}>{c.className}</option>
                  ))}
                </select>
              </FG>
              
              <FG label="Section" required error={errors.sectionName?.message}>
                <select 
                  {...register('sectionName')}
                  disabled={!selectedClassName}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50"
                >
                  <option value="">{selectedClassName ? 'Select Section' : 'Select Class First'}</option>
                  {schoolSections.map(s => (
                    <option key={s.id} value={s.sectionName}>{s.sectionName}</option>
                  ))}
                </select>
              </FG>
              
              <FG label="Max Student Limit" error={errors.maxLimit?.message}>
                <Input type="number" {...register('maxLimit')} className="rounded-xl" placeholder="e.g., 45" />
              </FG>

              {/* Teacher picker — replaces the raw UUID input */}
              <Controller
                name="classTeacherId"
                control={control}
                render={({ field }) => (
                  <TeacherSelectDropdown
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="erp-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8 flex flex-row items-center gap-3">
             <Fingerprint className="text-primary h-6 w-6" />
             <div>
                <CardTitle className="text-[14px] font-bold tracking-tight">Class Creation Guidelines</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="p-6">
              <ul className="space-y-2 text-sm text-muted-foreground font-medium leading-relaxed">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary/60 rounded-full"/> Each record represents a unique class + section combination.</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary/60 rounded-full"/> The combination of Class Name + Section Name must be unique.</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary/60 rounded-full"/> Selecting a class teacher will also mark them as a class teacher in the staff registry.</li>
              </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="px-6 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="px-10 h-12 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm">
                {isLoading ? 'Creating...' : 'Create Class'}
            </Button>
        </div>
      </form>
    </div>
  );
}
