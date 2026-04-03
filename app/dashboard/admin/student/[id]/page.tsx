'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, User, Phone, Mail, Fingerprint, ShieldAlert,
  TrendingUp, Download, Edit3, MoreHorizontal, CreditCard,
  MessageSquare, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock components from your UI folder
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const tabs = ['Overview', 'Academic', 'Registry', 'Billing'];

  useEffect(() => {
    const loadData = async () => {
      const summary = await adminService.getSummary();
      const found = summary.students.find((s: any) => s.id === studentId);
      setStudent(found);
      setLoading(false);
    };
    loadData();
  }, [studentId]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
      Initializing Registry...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:px-8 md:py-4 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
              <ArrowLeft size={18} className="text-slate-500" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{student?.name}</h1>
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold uppercase tracking-tighter shadow-none">
                  {student?.status || 'Active'}
                </Badge>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UID: {student?.schoolId || 'STU-9920'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-xs font-bold gap-2">
              <Download size={14} /> Report
            </Button>
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-xs font-bold gap-2 text-indigo-600">
              <CreditCard size={14} /> Fees
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <Button className="h-10 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold gap-2 px-6 transition-all">
              <Edit3 size={14} /> Edit Profile
            </Button>
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
              <MoreHorizontal size={18} className="text-slate-400" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">

          {/* LEFT COLUMN */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10" />
              <div className="relative mx-auto w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden mb-6 bg-slate-100 flex items-center justify-center">
                <User size={48} className="text-slate-300" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{student?.name}</h2>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Grade {student?.grade} — {student?.class}</p>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                  <p className="text-xl font-bold text-slate-900">94.2%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average GPA</p>
                  <p className="text-xl font-bold text-indigo-600">3.82</p>
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
                <button className="w-full flex items-center gap-3 p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-tight">Schedule Meeting</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-6 text-white">
              <div className="flex items-center gap-2 mb-6 opacity-80">
                <ShieldAlert size={16} className="text-amber-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Compliance Check</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Documents', status: 'Verified', color: 'text-emerald-400' },
                  { label: 'Fee Account', status: 'Pending', color: 'text-amber-400' },
                  { label: 'Conduct Registry', status: 'Exemplary', color: 'text-indigo-400' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", item.color)}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: SLIDING TABS */}
          <main className="col-span-12 lg:col-span-8">
            <div className="relative flex bg-transparent gap-8 border-b border-slate-200 w-full justify-start mb-8">
              {tabs.map((t) => {
                const id = t.toLowerCase();
                const isActive = activeTab === id;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "relative h-12 text-xs font-bold uppercase tracking-widest transition-colors duration-300",
                      isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {t}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Identity Card */}
                      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                          <Fingerprint size={14} className="text-slate-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Biometric Identity</span>
                        </div>
                        <CardContent className="p-6 space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <InfoItem label="Full Legal Name" value={student?.name} />
                            <InfoItem label="Date of Birth" value="14 Oct 2008" />
                            <InfoItem label="Gender" value="Female" />
                            <InfoItem label="Blood Group" value="O+" />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Contact Card */}
                      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Secure Contact</span>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <ContactItem icon={<Mail size={16} />} label="Student Email" value={student?.email} active />
                          <ContactItem icon={<Phone size={16} />} label="Emergency Contact" value="+1 882-992-00" />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Performance Timeline */}
                    <Card className="rounded-[2rem] border-slate-200 shadow-sm p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <TrendingUp size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Academic Trajectory</h3>
                      </div>
                      <div className="h-48 w-full flex items-end gap-3">
                        {[40, 70, 55, 90, 85].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                            <div className="w-full bg-slate-100 rounded-xl relative h-full overflow-hidden">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                className="absolute bottom-0 w-full bg-indigo-600/10 group-hover:bg-indigo-600 transition-all"
                              />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Term {i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="bg-white rounded-[2rem] border border-slate-200 p-20 text-center">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">{activeTab} module</p>
                    <p className="text-slate-400 text-sm italic">Detailed registry records for this section are being compiled...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

/* --- HELPER COMPONENTS --- */

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ContactItem({ icon, label, value, active }: any) {
  return (
    <div className={cn("flex items-center gap-4 p-3 rounded-2xl border transition-all", active ? "bg-indigo-50/50 border-indigo-100" : "bg-slate-50 border-slate-100")}>
      <div className={cn("w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm", active ? "text-indigo-600" : "text-slate-400")}>
        {icon}
      </div>
      <div>
        <p className={cn("text-[9px] font-bold uppercase tracking-widest", active ? "text-indigo-400" : "text-slate-400")}>{label}</p>
        <p className="text-xs font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}