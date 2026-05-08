'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { useCreateProgress, useUpdateProgress } from '@/hooks/useAcademic';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import type { TeachingProgress } from '@/services/academic/types';

interface FormValues { className: string; sectionName: string; subjectId: string; chapterId: number; topicId: number; status: string; completedOn: string; }
interface Props { open: boolean; onOpenChange: (o: boolean) => void; editItem: TeachingProgress | null; onSuccess: () => void; }

export const ProgressFormModal = React.memo(function ProgressFormModal({ open, onOpenChange, editItem, onSuccess }: Props) {
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateProgress();
  const updateMutation = useUpdateProgress();
  const isEditing = !!editItem;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (editItem) reset({
      className: editItem.className, sectionName: editItem.sectionName, subjectId: editItem.subjectId,
      chapterId: editItem.chapterId, topicId: editItem.topicId, status: editItem.status,
      completedOn: editItem.completedOn ? new Date(editItem.completedOn).toISOString().split('T')[0] : ''
    });
    else reset({ className: '', sectionName: '', subjectId: '', chapterId: 0, topicId: 0, status: 'not_started', completedOn: '' });
  }, [editItem, reset]);

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate({ id: editItem.id, data: { status: values.status, completedOn: values.completedOn ? new Date(values.completedOn).toISOString() : undefined } }, { onSuccess });
    } else {
      createMutation.mutate({
        session: CURRENT_SESSION, className: values.className, sectionName: values.sectionName,
        subjectId: values.subjectId, chapterId: values.chapterId, topicId: values.topicId,
        teacherId: user?.id ?? '', status: values.status,
        completedOn: values.completedOn ? new Date(values.completedOn).toISOString() : undefined,
      }, { onSuccess });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEditing ? 'Update Progress' : 'Log Progress'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Class" error={errors.className?.message} required><input {...register('className', { required: 'Required' })} className="field" /></FormField>
                <FormField label="Section" error={errors.sectionName?.message} required><input {...register('sectionName', { required: 'Required' })} className="field" /></FormField>
              </div>
              <FormField label="Subject ID" error={errors.subjectId?.message} required><input {...register('subjectId', { required: 'Required' })} className="field" /></FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Chapter ID" error={errors.chapterId?.message} required><input {...register('chapterId', { required: 'Required', valueAsNumber: true })} type="number" className="field" /></FormField>
                <FormField label="Topic ID" error={errors.topicId?.message} required><input {...register('topicId', { required: 'Required', valueAsNumber: true })} type="number" className="field" /></FormField>
              </div>
            </>
          )}
          <FormField label="Status" error={errors.status?.message} required>
            <select {...register('status', { required: 'Required' })} className="field">
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </FormField>
          <FormField label="Completed On" error={errors.completedOn?.message}>
            <input {...register('completedOn')} type="date" className="field" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" loading={isPending}>{isEditing ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
