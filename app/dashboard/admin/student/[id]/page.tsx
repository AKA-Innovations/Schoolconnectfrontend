'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, User, BookOpen, Mail, Phone, Calendar,
  Fingerprint, ShieldAlert, GraduationCap, MapPin,
  MoreHorizontal, Download, Edit3, Trash2,
  CheckCircle2, AlertCircle, TrendingUp, Clock,
  FileText, CreditCard, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock components from your UI library
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { adminService } from '@/services/admin.service';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      const summary = await adminService.getSummary();
      const found = summary.students.find((s: any) => s.id === studentId);
      setStudent(found);
      setLoading(false);
    };
    loadData();
  }, [studentId]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">Loading Student Registry...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* HEADER / ACTION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors"
            >
              <ArrowLeft size={18} className="text-slate-500" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{student?.name}</h1>
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold uppercase tracking-tighter">
                  {student?.status || 'Active'}
                </Badge>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UID: {student?.schoolId || 'STU-9920'}</p>
            </div>
          </div>

          {/* ADMIN CALLS TO ACTION */}
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-xs font-bold gap-2">
              <Download size={14} /> Report
            </Button>
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-xs font-bold gap-2">
              <CreditCard size={14} /> Fees
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <Button className="h-10 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold gap-2 px-6">
              <Edit3 size={14} /> Edit Profile
            </Button>
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
              <MoreHorizontal size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">

          {/* LEFT COLUMN: IDENTITY CARD */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10" />

              <div className="relative mx-auto w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden mb-6">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <User size={48} className="text-slate-300" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{student?.name}</h2>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Grade {student?.grade} — {student?.class}</p>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                  <p className="text-xl font-black text-slate-900">94.2%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average GPA</p>
                  <p className="text-xl font-black text-indigo-600">3.82</p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl group hover:bg-indigo-600 transition-all">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-tight">Contact Parent</span>
                  </div>
                  <ArrowLeft size={14} className="rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
                <button className="w-full flex items-center gap-3 p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Schedule Meeting</span>
                </button>
              </div>
            </div>

            {/* QUICK HEALTH CHECK */}
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white">
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert size={16} className="text-amber-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Administrative Status</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Documents', status: 'Verified', color: 'text-emerald-400' },
                  { label: 'Fee Account', status: 'Pending', color: 'text-amber-400' },
                  { label: 'Conduct Registry', status: 'Exemplary', color: 'text-indigo-400' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", item.color)}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILED TABS */}
          <div className="col-span-12 lg:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-transparent gap-8 h-12 p-0 border-b border-slate-200 rounded-none w-full justify-start">
                {['Overview', 'Academic', 'Registry', 'Billing'].map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t.toLowerCase()}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 px-0 h-12 text-xs font-black uppercase tracking-widest"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bio Information */}
                  <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                      <Fingerprint size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Biometric Identity</span>
                    </div>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Full Legal Name" value={student?.name} />
                        <InfoItem label="Date of Birth" value={student?.dateOfBirth || '14 Oct 2008'} />
                        <InfoItem label="Gender" value={student?.gender || 'Female'} />
                        <InfoItem label="Blood Group" value="O+" />
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <InfoItem label="Address" value="42nd Academic Blvd, North Wing Housing Complex" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Contact</span>
                    </div>
                    <CardContent className="p-6 space-y-5">
                      <div className="flex items-center gap-4 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                          <Mail size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Student Email</p>
                          <p className="text-xs font-bold text-slate-900">{student?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</p>
                          <p className="text-xs font-bold text-slate-900">{student?.phone || '+1 882-992-00'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Timeline */}
                <Card className="rounded-3xl border-slate-200 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-indigo-600" />
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Academic Trajectory</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-indigo-600" /> Current Year
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-slate-200" /> Class Avg
                      </div>
                    </div>
                  </div>
                  <div className="h-48 w-full flex items-end gap-3 pb-4">
                    {/* Simplified bar chart representation */}
                    {[20, 40, 60, 80].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                        <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden h-full">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            className="absolute bottom-0 w-full bg-indigo-600/10 group-hover:bg-indigo-600 transition-all rounded-t-lg"
                          />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Term {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="academic">
                {/* This would be your Subject Load/Grade Table card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                  <p className="text-slate-500 italic text-sm">Academic transcripts and course enrollment details...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1.5">{label}</p>
      <p className="text-sm font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  )
}