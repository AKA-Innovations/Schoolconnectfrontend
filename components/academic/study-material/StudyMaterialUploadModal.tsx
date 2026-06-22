'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { FileUploadZone } from '../shared/FileUploadZone';
import { AssignmentSelector } from '../shared/AssignmentSelector';
import { ChapterSelect } from '../shared/ChapterSelect';
import { TopicSelect } from '../shared/TopicSelect';
import { useUploadStudyMaterial } from '@/hooks/useAcademic';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';

interface FormValues {
  title: string;
  assignmentKey: string;
  chapterId: string;
  topicId: string;
  description: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess: () => void;
}

export const StudyMaterialUploadModal = React.memo(function StudyMaterialUploadModal({ 
  open, 
  onOpenChange, 
  onSuccess 
}: Props) {
  const uploadMutation = useUploadStudyMaterial();
  const [file, setFile] = useState<File | null>(null);

  const [selectedClassName, setSelectedClassName] = useState<string | undefined>();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(); // Mapping ID
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>();
  const [selectedClassSectionId, setSelectedClassSectionId] = useState<number | undefined>();
  const [selectedSubjectDtlsId, setSelectedSubjectDtlsId] = useState<number | undefined>();

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      assignmentKey: '',
      chapterId: '',
      topicId: '',
      description: '',
    },
  });

  const assignmentKey = watch('assignmentKey');
  const chapterId = watch('chapterId');

  useEffect(() => {
    if (open) {
      reset();
      setFile(null);
      setSelectedClassName(undefined);
      setSelectedSubjectId(undefined);
      setSelectedClassId(undefined);
      setSelectedClassSectionId(undefined);
      setSelectedSubjectDtlsId(undefined);
    }
  }, [open, reset]);

  const onSubmit = (values: FormValues) => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!selectedClassId || !selectedClassSectionId || !selectedSubjectDtlsId) {
      toast.error('Unable to resolve class/subject identifiers. Please re-select the class.');
      return;
    }

    uploadMutation.mutate({
      session: CURRENT_SESSION,
      classId: selectedClassId,
      classSectionId: selectedClassSectionId,
      subjectId: selectedSubjectDtlsId,
      chapterId: values.chapterId ? Number(values.chapterId) : undefined,
      topicId: values.topicId ? Number(values.topicId) : undefined,
      title: values.title,
      description: values.description,
      file,
    }, {
      onSuccess: () => {
        toast.success('Study material uploaded successfully');
        onSuccess();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
          <DialogDescription>
            Share educational resources, notes, or presentations with your students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="assignmentKey"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <AssignmentSelector
                value={field.value}
                error={errors.assignmentKey?.message}
                onChange={(val, detail) => {
                  field.onChange(val);
                  setSelectedClassName(detail?.className);
                  setSelectedSubjectId(detail?.subjectDtlsId ? String(detail.subjectDtlsId) : undefined);
                  setSelectedClassId(detail?.classId);
                  setSelectedClassSectionId(detail?.classSectionId);
                  setSelectedSubjectDtlsId(detail?.subjectDtlsId);
                  setValue('chapterId', '');
                  setValue('topicId', '');
                }}
              />
            )}
          />

          <FormField label="Document Title" error={errors.title?.message} required>
            <input
              type="text"
              {...register('title', { required: 'Required' })}
              className="field h-10"
              placeholder="e.g. Introduction to Algebra Notes"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="chapterId"
              control={control}
              render={({ field }) => (
                <ChapterSelect
                  className={selectedClassName}
                  subjectId={selectedSubjectId}
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    setValue('topicId', '');
                  }}
                  error={errors.chapterId?.message}
                  disabled={!assignmentKey}
                />
              )}
            />

            <Controller
              name="topicId"
              control={control}
              render={({ field }) => (
                <TopicSelect
                  chapterId={chapterId}
                  subjectId={selectedSubjectDtlsId}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.topicId?.message}
                  disabled={!chapterId}
                />
              )}
            />
          </div>

          <FormField label="Description" error={errors.description?.message} required>
            <textarea
              {...register('description', { required: 'Required' })}
              className="field min-h-[100px] resize-y"
              placeholder="Provide a brief description of the material..."
            />
          </FormField>

          <FormField label="File Resource" required>
            <FileUploadZone onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploadMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={uploadMutation.isPending} disabled={!file || !assignmentKey}>
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Material'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
