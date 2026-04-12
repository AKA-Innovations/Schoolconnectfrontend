'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/FormField';
import { SectionTitle } from '@/components/ui/SectionTitle';
import {
  ArrowLeft, ShieldCheck, Phone, Globe, IdCard
} from 'lucide-react';
import { useRegisterStudent } from '@/hooks/useStudents';
import type { RegisterStudentPayload } from '@/services/student.service';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore'; // ✅ ADDED

// ---------------- Schema ----------------
const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  bloodGroup: z.string().optional(),
  mobileNumber: z.string().min(10, 'Valid mobile number required'),
  alternateMobileNumber: z.string().optional(),
  emailId: z.string().email('Invalid email address'),
  caste: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  username: z.string().min(3, 'Username required (min 3 chars)'),
  password: z.string().min(6, 'Password required (min 6 chars)'),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ---------------- Component ----------------
export function StudentRegistrationForm({ onSuccess, onCancel }: Props) {
  const mutation = useRegisterStudent();
  const { schoolId } = useAuthStore(); // ✅ GET SCHOOL ID

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nationality: 'Indian',
      gender: '',
      bloodGroup: '',
    },
  });

  // ---------------- Submit ----------------
  const onSubmit = (data: StudentFormValues) => {
    if (!schoolId) {
      toast.error('School not found. Please login again.');
      return;
    }

    const payload: RegisterStudentPayload = {
      ...data,
      schoolId, // ✅ INJECTED
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(`Student ${data.firstName} ${data.lastName} enrolled successfully`);
        onSuccess?.();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to enroll student');
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <button
          type="button"
          onClick={onCancel}
          className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
        </button>
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Enroll New Student
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            Add student records dynamically to the registry
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Personal Identity */}
        <Card className="p-1 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <ShieldCheck size={18} className="text-slate-400" />
            </div>
            <SectionTitle description="Legal identity required for certificates">
              Personal Identity
            </SectionTitle>
          </div>

          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="First Name" required error={errors.firstName?.message}>
              <input {...register('firstName')} className="field" />
            </FormField>

            <FormField label="Last Name" required error={errors.lastName?.message}>
              <input {...register('lastName')} className="field" />
            </FormField>

            <FormField label="Date of Birth" required error={errors.dateOfBirth?.message}>
              <input type="date" {...register('dateOfBirth')} className="field" />
            </FormField>

            <FormField label="Gender" required error={errors.gender?.message}>
              <select {...register('gender')} className="field">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Mobile Number" required error={errors.mobileNumber?.message}>
            <input type="tel" {...register('mobileNumber')} className="field" />
          </FormField>

          <FormField label="Email" required error={errors.emailId?.message}>
            <input type="email" {...register('emailId')} className="field" />
          </FormField>
        </Card>

        {/* Credentials */}
        <Card className="p-8 bg-slate-900 text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Username" required error={errors.username?.message}>
              <input {...register('username')} className="field bg-white/10 text-white border-white/10" />
            </FormField>

            <FormField label="Password" required error={errors.password?.message}>
              <input type="password" {...register('password')} className="field bg-white/10 text-white border-white/10" />
            </FormField>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={!schoolId || mutation.isPending}
          >
            {mutation.isPending ? 'Submitting...' : 'Enroll Student'}
          </Button>
        </div>

      </form>
    </div>
  );
}