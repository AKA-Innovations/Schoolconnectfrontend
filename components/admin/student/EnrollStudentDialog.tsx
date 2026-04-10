'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/FormField';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { ArrowLeft, UserPlus, ShieldCheck, Mail, Phone, Globe, IdCard } from 'lucide-react';
import { useRegisterStudent } from '@/hooks/useStudents';
import type { RegisterStudentPayload } from '@/services/student.service';
import { toast } from 'sonner';

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

export function StudentRegistrationForm({ onSuccess, onCancel }: Props) {
  const mutation = useRegisterStudent();

  const { register, handleSubmit, formState: { errors } } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nationality: 'Indian',
      gender: '',
      bloodGroup: '',
    }
  });

  const onSubmit = (data: StudentFormValues) => {
    mutation.mutate(data as RegisterStudentPayload, {
      onSuccess: () => {
        toast.success(`Student ${data.firstName} ${data.lastName} enrolled successfully`);
        onSuccess?.();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to enroll student');
      }
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
          <h2 className="text-3xl font-display font-bold text-slate-900">Enroll New Student</h2>
          <p className="text-sm text-slate-400 font-medium">Add student records dynamically to the registry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Identity */}
        <Card className="p-1 overflow-hidden animate-fade-up">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <ShieldCheck size={18} className="text-slate-400" />
              </div>
              <SectionTitle description="Legal identity required for certificates">Personal Identity</SectionTitle>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="First Name" required error={errors.firstName?.message}>
              <input {...register('firstName')} className="field" placeholder="e.g. Aarav" />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName?.message}>
              <input {...register('lastName')} className="field" placeholder="e.g. Sharma" />
            </FormField>
            <FormField label="Date of Birth" required error={errors.dateOfBirth?.message}>
              <input type="date" {...register('dateOfBirth')} className="field" />
            </FormField>
            <FormField label="Gender" required error={errors.gender?.message}>
              <select {...register('gender')} className="field">
                <option value="">Select Option</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
            <FormField label="Blood Group" error={errors.bloodGroup?.message}>
              <select {...register('bloodGroup')} className="field">
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </FormField>
          </div>
        </Card>

        {/* Contact Coordinates */}
        <Card className="p-1 overflow-hidden animate-fade-up stagger-1">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <Phone size={18} className="text-slate-400" />
              </div>
              <SectionTitle description="Primary channels for alerts & reports">Contact Coordinates</SectionTitle>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Mobile Number" required error={errors.mobileNumber?.message}>
              <input type="tel" {...register('mobileNumber')} className="field" placeholder="+91 9999999999" />
            </FormField>
            <FormField label="Alternate Mobile" error={errors.alternateMobileNumber?.message}>
              <input type="tel" {...register('alternateMobileNumber')} className="field" placeholder="Optional" />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Email Address" required error={errors.emailId?.message}>
                <input type="email" {...register('emailId')} className="field" placeholder="student@email.com" />
              </FormField>
            </div>
          </div>
        </Card>

        {/* Demographics */}
        <Card className="p-1 overflow-hidden animate-fade-up stagger-2">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <Globe size={18} className="text-slate-400" />
              </div>
              <SectionTitle description="Demographic records">Additional Profile</SectionTitle>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Caste" error={errors.caste?.message}>
              <input {...register('caste')} className="field" placeholder="Optional" />
            </FormField>
            <FormField label="Religion" error={errors.religion?.message}>
              <input {...register('religion')} className="field" placeholder="Optional" />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Nationality" error={errors.nationality?.message}>
                <input {...register('nationality')} className="field" placeholder="Indian" />
              </FormField>
            </div>
          </div>
        </Card>

        {/* Credentials */}
        <Card className="p-1 overflow-hidden animate-fade-up stagger-3 bg-slate-900 border-none text-white shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-sm">
                <IdCard size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-[0.2em] leading-none mb-2">Student Account</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">System login credentials</p>
                <div className="w-10 h-0.5 bg-primary mt-3 rounded-full opacity-60" />
              </div>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Username" required error={errors.username?.message}>
               <input {...register('username')} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[14px] text-white outline-none transition-all duration-200 focus:border-primary focus:bg-white/10" placeholder="student_username" />
            </FormField>
            <FormField label="Password" required error={errors.password?.message}>
               <input type="password" {...register('password')} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[14px] text-white outline-none transition-all duration-200 focus:border-primary focus:bg-white/10" placeholder="Access Password" />
            </FormField>
          </div>
        </Card>

        {/* Actions Drop */}
        <div className="flex items-center justify-between p-8 border-t border-slate-200 bg-white/50 backdrop-blur-sm rounded-3xl animate-fade-up stagger-4 shadow-xl shadow-slate-200/50 sticky bottom-8 z-50">
          <p className="text-xs text-slate-400 font-medium">Verify credentials before committing.</p>
          <div className="flex gap-4">
            <Button type="button" variant="secondary" onClick={onCancel}>Discard</Button>
            <Button type="submit" loading={mutation.isPending} className="px-10 shadow-lg shadow-primary/20">Enroll Student</Button>
          </div>
        </div>
      </form>
    </div>
  );
}