'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { useCreateClasswork, useUpdateClasswork } from '@/hooks/useAcademic';
import { useSubjectDetails } from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { formatDate } from '@/lib/dateUtils';
import type { Classwork } from '@/services/academic/types';
import type { SubjectDetail } from '@/types/class.types';

interface FormValues {
  assignmentKey: string; // composite "className|sectionName|subjectName"
  description: string;
  conductedOn: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editItem: Classwork | null;
  onSuccess: () => void;
  prefill?: {
    className: string;
    sectionName: string;
    subjectId: string; // mapping ID
  };
}

export const ClassworkFormModal = React.memo(function ClassworkFormModal({
  open, onOpenChange, editItem, onSuccess, prefill,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateClasswork();
  const updateMutation = useUpdateClasswork();
  const isEditing = !!editItem;

  // Get teacher's subject assignments from the teacher-subject mapping
  const { data: allSubjectDetails = [] } = useSubjectDetails(user?.id);

  // Filter to only this teacher's assignments for the current session
  const myAssignments: SubjectDetail[] = useMemo(() => {
    if (!user?.id) return [];
    return allSubjectDetails.filter(sd => sd.session === CURRENT_SESSION);
  }, [allSubjectDetails, user?.id]);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: { assignmentKey: '', description: '', conductedOn: '' },
  });

  useEffect(() => {
    if (editItem) {
      reset({
        assignmentKey: '',
        description: editItem.description,
        conductedOn: formatDate(new Date(editItem.conductedOn), 'yyyy-MM-dd'),
      });
    } else if (prefill && open) {
      reset({
        assignmentKey: `${prefill.className}|${prefill.sectionName}|${prefill.subjectId}`,
        description: '',
        conductedOn: formatDate(new Date(), 'yyyy-MM-dd'),
      });
    } else {
      reset({
        assignmentKey: '',
        description: '',
        conductedOn: formatDate(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [editItem, reset, prefill, open]);

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        {
          id: editItem.id,
          data: {
            description: values.description,
            conductedOn: new Date(values.conductedOn).toISOString(),
          },
        },
        { onSuccess },
      );
      return;
    }

    const [classId, sectionId, subjectId] = values.assignmentKey.split('|');
    createMutation.mutate(
      {
        session: CURRENT_SESSION,
        classId,
        sectionId,
        subjectId,
        description: values.description,
        conductedOn: new Date(values.conductedOn).toISOString(),
        teacherId: user?.id ?? '',
      },
      { onSuccess },
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Classwork' : 'Add Classwork'}</DialogTitle>
          {!isEditing && (
            <DialogDescription>
              Log classwork for one of your classes. Selections are based on your teaching schedule.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Smart assignment picker — only shown when creating */}
          {!isEditing && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Class / Section / Subject *
              </label>
              <Controller
                name="assignmentKey"
                control={control}
                rules={{ required: 'Please select a class assignment' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">— Select your class —</option>
                    {myAssignments.length === 0 ? (
                      <option disabled value="">No assignments found for this session</option>
                    ) : (
                      myAssignments.map((sd) => (
                        <option
                          key={sd.id}
                          value={`${sd.className}|${sd.sectionName}|${sd.id}`}
                        >
                          Class {sd.className} — {sd.sectionName} &nbsp;|&nbsp; {sd.subjectName}
                        </option>
                      ))
                    )}
                  </select>
                )}
              />
              {errors.assignmentKey && (
                <p className="text-xs text-destructive">{errors.assignmentKey.message}</p>
              )}
            </div>
          )}

          <FormField label="Description / What was covered" error={errors.description?.message} required>
            <textarea
              {...register('description', { required: 'Required' })}
              className="field min-h-[100px] resize-y"
              placeholder="Topics covered in today's class..."
            />
          </FormField>

          <FormField label="Conducted On" error={errors.conductedOn?.message} required>
            <input
              {...register('conductedOn', { required: 'Required' })}
              type="date"
              className="field"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEditing ? 'Update' : 'Save Classwork'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
