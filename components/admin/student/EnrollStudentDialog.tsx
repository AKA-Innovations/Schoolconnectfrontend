'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  UserPlus,
  ShieldCheck,
  Calendar,
  Mail,
  Phone,
  ChevronDown,
  Fingerprint,
  Globe,
  HeartPulse,
  IdCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRegisterStudent } from '@/hooks/useStudents';
import type { RegisterStudentPayload } from '@/services/student.service';

const emptyForm = (): RegisterStudentPayload => ({
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  mobileNumber: '',
  emailId: '',
  bloodGroup: '',
  alternateMobileNumber: '',
  caste: '',
  religion: '',
  nationality: '',
});

interface StudentRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StudentRegistrationForm({
  onSuccess,
  onCancel,
}: StudentRegistrationFormProps) {
  const [form, setForm] = useState<RegisterStudentPayload>(emptyForm());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const mutation = useRegisterStudent();

  const patch = (key: keyof RegisterStudentPayload, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    const required: (keyof RegisterStudentPayload)[] = [
      'username',
      'password',
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'mobileNumber',
      'emailId',
    ];

    const missing = required.find(k => !form[k]);
    return missing ? `${missing} is required` : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);

    mutation.mutate(form, {
      onSuccess: () => {
        setForm(emptyForm());
        setLoading(false);
        onSuccess?.();
      },
      onError: (err: any) => {
        setError(
          err?.response?.data?.message ??
            'Registration failed. Please try again.'
        );
        setLoading(false);
      },
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onCancel}
            className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-6 bg-indigo-600 rounded-full" />
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em]">
                Student Registry
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Enroll New Student
            </h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 px-5 py-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-semibold">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-10"
      >
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-10">
          {/* Personal Identity */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserPlus size={120} />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                Personal Identity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  First Given Name
                </label>
                <input
                  required
                  value={form.firstName}
                  onChange={e => patch('firstName', e.target.value)}
                  className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  placeholder="e.g. Aarav"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Surname
                </label>
                <input
                  required
                  value={form.lastName}
                  onChange={e => patch('lastName', e.target.value)}
                  className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  placeholder="e.g. Sharma"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Birth Date
                </label>
                <div className="relative">
                  <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    type="date"
                    required
                    value={form.dateOfBirth}
                    onChange={e => patch('dateOfBirth', e.target.value)}
                    className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Gender
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                  <select
                    required
                    value={form.gender}
                    onChange={e => patch('gender', e.target.value)}
                    className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold appearance-none focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Blood Group
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                  <select
                    value={form.bloodGroup ?? ''}
                    onChange={e => patch('bloodGroup', e.target.value)}
                    className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold appearance-none focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  >
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                      bg => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Phone size={20} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                Contact Coordinates
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    type="tel"
                    required
                    value={form.mobileNumber}
                    onChange={e => patch('mobileNumber', e.target.value)}
                    className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                    placeholder="+91 9999999999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Alternate Mobile
                </label>
                <div className="relative">
                  <Phone className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    type="tel"
                    value={form.alternateMobileNumber ?? ''}
                    onChange={e =>
                      patch('alternateMobileNumber', e.target.value)
                    }
                    className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                    placeholder="+91 8888888888"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    type="email"
                    required
                    value={form.emailId}
                    onChange={e => patch('emailId', e.target.value)}
                    className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                    placeholder="student@email.com"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Additional Profile */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Globe size={20} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                Additional Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Caste
                </label>
                <input
                  value={form.caste ?? ''}
                  onChange={e => patch('caste', e.target.value)}
                  className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold outline-none transition-all"
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Religion
                </label>
                <input
                  value={form.religion ?? ''}
                  onChange={e => patch('religion', e.target.value)}
                  className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold outline-none transition-all"
                  placeholder="Optional"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Nationality
                </label>
                <input
                  value={form.nationality ?? ''}
                  onChange={e => patch('nationality', e.target.value)}
                  className="w-full h-14 px-6 bg-slate-50/50 border rounded-2xl text-sm font-bold outline-none transition-all"
                  placeholder="Indian"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Student Account */}
          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-300">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <IdCard size={20} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest">
                Student Account
              </h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Username
                </label>
                <input
                  required
                  value={form.username}
                  onChange={e => patch('username', e.target.value)}
                  className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold focus:bg-white/10 outline-none transition-all"
                  placeholder="student_username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => patch('password', e.target.value)}
                  className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold focus:bg-white/10 outline-none transition-all"
                  placeholder="Access Password"
                />
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                  Student Metadata
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      icon: <HeartPulse size={14} />,
                      label: form.bloodGroup || 'Blood Group Pending',
                    },
                    {
                      icon: <Mail size={14} />,
                      label: form.emailId || 'Email Not Assigned',
                    },
                    {
                      icon: <Phone size={14} />,
                      label: form.mobileNumber || 'Contact Not Added',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-[11px] font-bold">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Security Credentials */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-6">
              <Fingerprint className="text-indigo-600" size={18} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                Registration Status
              </h3>
            </div>

            <motion.div
              initial={{ opacity: 0.7, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5"
            >
              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                Student profile will be created with primary identity,
                communication details, and institutional credentials.
              </p>
            </motion.div>
          </section>

          {/* Actions */}
          <div className="space-y-4">
            <button
              disabled={loading || mutation.isPending}
              type="submit"
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-bold text-sm shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {loading || mutation.isPending ? (
                'Processing enrollment...'
              ) : (
                <>
                  <Save size={18} />
                  Commit Registration
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full h-12 text-slate-400 hover:text-rose-500 font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              Abort Mission
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}