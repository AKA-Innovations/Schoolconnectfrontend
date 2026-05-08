'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { FileUploadZone } from '../shared/FileUploadZone';
import { useUploadStudyMaterial } from '@/hooks/useAcademic';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';

interface FormValues { classId: string; sectionId: string; subjectId: string; description: string; }
interface Props { open: boolean; onOpenChange: (o: boolean) => void; onSuccess: () => void; }

export const StudyMaterialUploadModal = React.memo(function StudyMaterialUploadModal({ open, onOpenChange, onSuccess }: Props) {
  const user = useAuthStore((s) => s.user);
  const uploadMutation = useUploadStudyMaterial();
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { classId: '', sectionId: '', subjectId: '', description: '' },
  });

  const onSubmit = (values: FormValues) => {
    if (!file) return;
    uploadMutation.mutate({
      session: CURRENT_SESSION, classId: values.classId, sectionId: values.sectionId,
      subjectId: values.subjectId, description: values.description,
      teacherId: user?.id ?? '', file,
    }, {
      onSuccess: () => { reset(); setFile(null); onSuccess(); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Upload Study Material</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Class ID" error={errors.classId?.message} required><input {...register('classId', { required: 'Required' })} className="field" /></FormField>
            <FormField label="Section ID" error={errors.sectionId?.message} required><input {...register('sectionId', { required: 'Required' })} className="field" /></FormField>
            <FormField label="Subject ID" error={errors.subjectId?.message} required><input {...register('subjectId', { required: 'Required' })} className="field" /></FormField>
          </div>
          <FormField label="Description" error={errors.description?.message} required>
            <textarea {...register('description', { required: 'Required' })} className="field min-h-[80px] resize-y" placeholder="Material description..." />
          </FormField>
          <FormField label="File" required>
            <FileUploadZone onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploadMutation.isPending}>Cancel</Button>
            <Button type="submit" loading={uploadMutation.isPending} disabled={!file}>Upload</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
