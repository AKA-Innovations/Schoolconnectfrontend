'use client';

import React, { useState } from 'react';
import {
  Plus, ArrowLeft, Save, UserPlus, Fingerprint,
  Briefcase, GraduationCap as SchoolIcon, X,
  ShieldCheck, Globe, Calendar, Mail, Phone,
  CheckCircle2, ChevronDown
} from 'lucide-react';
import { teacherService } from '@/services/teacher.service';
import { TeacherRegistrationData, TeacherClass } from '@/types/roles';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

interface TeacherRegistrationFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: any;
}

// --- Helper for conditional classes ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export function TeacherRegistrationForm({ onCancel, onSuccess, initialData }: TeacherRegistrationFormProps) {
  const { schoolId } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<TeacherRegistrationData>({
    username: '',
    password: '',
    schoolId: schoolId || '',
    employeeId: '',
    isPrincipal: false,
    isCoordinator: false,
    isClassTeacher: false,
    isSubjectTeacher: false,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    emailId: '',
    joiningDate: '',
    employeeEmail: '',
    classes: [],
  });

  const [newClass, setNewClass] = useState<TeacherClass>({
    className: '',
    sectionName: '',
    subjectName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: !(prev as any)[name] }));
  };

  const addClass = () => {
    if (newClass.className && newClass.sectionName && newClass.subjectName) {
      setFormData(prev => ({
        ...prev,
        classes: [...prev.classes, { ...newClass }]
      }));
      setNewClass({ className: '', sectionName: '', subjectName: '' });
    }
  };

  const removeClass = (index: number) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teacherService.registerTeacher(formData);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Registration protocol failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button
            onClick={onCancel}
            className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-6 bg-indigo-600 rounded-full" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Institutional Node</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              {initialData ? 'Update Profile' : 'Onboard Faculty'}
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column: Primary Data */}
        <div className="lg:col-span-8 space-y-10">

          {/* Section: Identity */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserPlus size={120} />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Personal Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Given Name</label>
                <input name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full h-14 px-6 bg-slate-50/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" placeholder="e.g. Jean" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Surname</label>
                <input name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full h-14 px-6 bg-slate-50/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" placeholder="e.g. Grey" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Birth Date</label>
                <div className="relative">
                  <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input name="dateOfBirth" type="date" required value={formData.dateOfBirth} onChange={handleInputChange} className="w-full h-14 px-6 bg-slate-50/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender Matrix</label>
                <div className="relative">
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full h-14 px-6 bg-slate-50/50 border-none rounded-2xl text-sm font-bold appearance-none focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all">
                    <option value="">Select Option</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Academic Assignments */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <SchoolIcon size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Pedagogy Scope</h3>
              </div>
              <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-full text-slate-500 uppercase tracking-tighter">
                {formData.classes.length} Linked Assignments
              </span>
            </div>

            {/* Class Adder UI */}
            <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex flex-wrap gap-4 items-end mb-8">
              <div className="flex-1 min-w-[120px] space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade</label>
                <input placeholder="10" value={newClass.className} onChange={e => setNewClass({ ...newClass, className: e.target.value })} className="w-full h-12 px-4 bg-white border-none rounded-xl text-xs font-bold outline-none" />
              </div>
              <div className="flex-1 min-w-[80px] space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Section</label>
                <input placeholder="A" value={newClass.sectionName} onChange={e => setNewClass({ ...newClass, sectionName: e.target.value })} className="w-full h-12 px-4 bg-white border-none rounded-xl text-xs font-bold outline-none" />
              </div>
              <div className="flex- min-w-[150px] space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Expertise</label>
                <input placeholder="Quantum Physics" value={newClass.subjectName} onChange={e => setNewClass({ ...newClass, subjectName: e.target.value })} className="w-full h-12 px-4 bg-white border-none rounded-xl text-xs font-bold outline-none" />
              </div>
              <button type="button" onClick={addClass} className="h-12 w-12 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-100">
                <Plus size={20} />
              </button>
            </div>

            {/* Class Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence mode='popLayout'>
                {formData.classes.map((cls, idx) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all shadow-sm"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-900">Grade {cls.className} — {cls.sectionName}</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{cls.subjectName}</p>
                    </div>
                    <button type="button" onClick={() => removeClass(idx)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all">
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {formData.classes.length === 0 && (
                <div className="col-span-full py-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center opacity-30">
                  <Globe size={32} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Pedagogical Mapping</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Credentials & Employment */}
        <div className="lg:col-span-4 space-y-8">

          {/* Section: Employment Details */}
          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-300">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">Employment</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Corporate ID</label>
                <input name="employeeId" required value={formData.employeeId} onChange={handleInputChange} className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold focus:bg-white/10 outline-none transition-all" placeholder="FAC-001" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Email</label>
                <input name="employeeEmail" type="email" required value={formData.employeeEmail} onChange={handleInputChange} className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold focus:bg-white/10 outline-none transition-all" placeholder="faculty@institution.edu" />
              </div>

              {/* Roles Matrix */}
              <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Institutional Roles</p>
                <div className="space-y-2">
                  {[
                    { id: 'isPrincipal', label: 'Principal Seat' },
                    { id: 'isCoordinator', label: 'Department Head' },
                    { id: 'isClassTeacher', label: 'Class Mentor' },
                    { id: 'isSubjectTeacher', label: 'Instructional Faculty' }
                  ].map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleCheckboxChange(role.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                        (formData as any)[role.id] ? "bg-indigo-600 border-indigo-500" : "bg-transparent border-white/5 hover:bg-white/5"
                      )}
                    >
                      <span className="text-[11px] font-bold">{role.label}</span>
                      {(formData as any)[role.id] && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Account Security */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-6">
              <Fingerprint className="text-indigo-600" size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Security Credentials</h3>
            </div>
            <div className="space-y-4">
              <input name="username" required value={formData.username} onChange={handleInputChange} className="w-full h-12 px-5 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" placeholder="System Username" />
              {!initialData && (
                <input name="password" type="password" required value={formData.password} onChange={handleInputChange} className="w-full h-12 px-5 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" placeholder="Access Password" />
              )}
            </div>
          </section>

          {/* Form Actions */}
          <div className="space-y-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? 'Processing protocol...' : (
                <>
                  <Save size={18} />
                  {initialData ? 'Synchronize Record' : 'Commit Registration'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full h-12 text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-colors"
            >
              Abort Mission
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}