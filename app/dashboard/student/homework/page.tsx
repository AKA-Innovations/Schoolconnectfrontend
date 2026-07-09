'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useStudent } from '@/hooks/useStudents';
import {
  useHomeworks,
  useHomeworkSubmissions,
  useHomeworkDocuments,
  useUploadHomeworkDocument,
  useCreateSubmission,
  useUpdateSubmission,
} from '@/hooks/useAcademic';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Loader2,
  ChevronRight,
  Download,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { toast } from 'sonner';
import { CURRENT_SESSION } from '@/lib/constants';
import { formatDate } from '@/lib/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function StudentHomeworkPage() {
  const user = useAuthStore((s) => s.user);
  const { data: studentDetails, isLoading: studentLoading } = useStudent(user?.id || '');

  const studentAcademic = studentDetails?.academics?.[0];
  const className = studentAcademic?.className;

  // Query all homeworks for student's class
  const { data: homeworksData, isLoading: homeworksLoading } = useHomeworks({
    className,
    page: 1,
    limit: 100,
  });
  const homeworks = Array.isArray(homeworksData) ? homeworksData : ((homeworksData as any)?.items ?? []);

  const [selectedHw, setSelectedHw] = useState<any>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active query for submissions & documents of selected homework to see status
  const { data: submissions = [] } = useHomeworkSubmissions(selectedHw?.id || 0);
  const { data: documents = [] } = useHomeworkDocuments(selectedHw?.id || 0);

  const uploadDocMut = useUploadHomeworkDocument();
  const createSubMut = useCreateSubmission();
  const updateSubMut = useUpdateSubmission(selectedHw?.id || 0);

  const mySubmission = React.useMemo(() => {
    return submissions.find((s) => s.studentId === user?.id);
  }, [submissions, user?.id]);

  const myDocument = React.useMemo(() => {
    return documents.find((d) => d.studentId === user?.id);
  }, [documents, user?.id]);

  const getStatusBadge = (hwId: number, dueDate: string) => {
    const sub = submissions.find((s) => s.homeworkId === hwId && s.studentId === user?.id);
    if (sub) {
      if (sub.status === 'SUBMITTED') {
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50 font-bold">Submitted</Badge>;
      }
      if (sub.status === 'LATE') {
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-50 font-bold">Late Submission</Badge>;
      }
      if (sub.status === 'GRADED') {
        return <Badge className="bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-50 font-bold">Graded</Badge>;
      }
    }
    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) {
      return <Badge variant="destructive" className="font-bold">Overdue</Badge>;
    }
    return <Badge className="bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold">Pending</Badge>;
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHw || !user?.id) return;

    setIsSubmitting(true);
    try {
      // 1. If file is chosen, upload document
      if (file) {
        await uploadDocMut.mutateAsync({
          session: CURRENT_SESSION,
          homeworkId: selectedHw.id,
          studentId: user.id,
          file,
        });
      }

      const status = new Date(selectedHw.dueDate) < new Date() ? 'LATE' : 'SUBMITTED';

      // 2. Create or update submission record
      if (mySubmission) {
        await updateSubMut.mutateAsync({
          id: mySubmission.id,
          data: {
            remarks: remarks || mySubmission.remarks || undefined,
            status,
            submittedAt: new Date().toISOString(),
          },
        });
      } else {
        await createSubMut.mutateAsync({
          session: CURRENT_SESSION,
          homeworkId: selectedHw.id,
          studentId: user.id,
          remarks,
          status,
          submittedAt: new Date().toISOString(),
        });
      }

      toast.success('Assignment submitted successfully!');
      setSubmitDialogOpen(false);
      setRemarks('');
      setFile(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit work');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Homework</h1>
        <p className="text-sm text-slate-400 mt-1">View, track, and upload homework assignments for Class {className || '...'}</p>
      </div>

      {studentLoading || homeworksLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl w-full" />
          ))}
        </div>
      ) : homeworks.length === 0 ? (
        <Card className="rounded-[2rem] border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
          <Clock size={40} className="text-slate-300 mb-4" />
          <h3 className="font-bold text-slate-700">No Homework Assigned</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1">Excellent! You are all caught up on your studies for Class {className}.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {homeworks.map((hw: any) => {
              const isSelected = selectedHw?.id === hw.id;
              return (
                <div
                  key={hw.id}
                  onClick={() => setSelectedHw(hw)}
                  className={`p-5 rounded-[2rem] border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-teal-50/10 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">{hw.subjectName}</span>
                      {getStatusBadge(hw.id, hw.dueDate)}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{hw.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar size={14} /> Due: {formatDate(new Date(hw.dueDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 self-end sm:self-auto" />
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            {selectedHw ? (
              <Card className="rounded-[2rem] sticky top-6">
                <CardHeader>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">{selectedHw.subjectName}</span>
                  <CardTitle className="text-lg">{selectedHw.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar size={13} /> Due: {formatDate(new Date(selectedHw.dueDate), 'MMM dd, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-700">Description</h4>
                    <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{selectedHw.description}</p>
                  </div>

                  {/* Submission details if already submitted */}
                  {mySubmission && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileCheck2 size={14} className="text-emerald-500" /> My Submission
                      </h4>
                      {myDocument && (
                        <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-600 truncate">{myDocument.documentUrl.split('/').pop()}</span>
                          {myDocument.signedUrl && (
                            <a
                              href={myDocument.signedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-teal-600 flex items-center gap-1 hover:underline shrink-0"
                            >
                              <Eye size={12} /> View
                            </a>
                          )}
                        </div>
                      )}
                      {mySubmission.remarks && (
                        <p className="text-[11px] text-slate-500 italic">“{mySubmission.remarks}”</p>
                      )}
                      {mySubmission.status === 'GRADED' && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Teacher Grade / Remarks:</span>
                          <p className="text-xs text-slate-800 font-bold mt-0.5">{(mySubmission as any).grade || 'No Grade'}</p>
                          <p className="text-xs text-slate-500">{mySubmission.remarks || 'No remarks.'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => setSubmitDialogOpen(true)}
                    className="w-full bg-[#00A99D] hover:bg-[#00897B] text-white font-bold rounded-xl h-11"
                  >
                    {mySubmission ? 'Resubmit Work' : 'Submit Assignment'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[2rem] border-dashed border-2 py-12 flex flex-col items-center justify-center text-center text-slate-400">
                <FileText size={32} className="mb-2" />
                <p className="text-xs">Select a homework from the list to view details and submit.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Submission Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Homework</DialogTitle>
            <DialogDescription>Submit your work for {selectedHw?.title}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitWork} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-xs">File Attachment</Label>
              <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-all relative">
                <input
                  type="file"
                  id="homework-file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Upload className="text-slate-400 mb-2" size={24} />
                <span className="text-xs font-bold text-slate-600">
                  {file ? file.name : 'Upload your document or image'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">PDF, Word, or JPG up to 10MB</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-slate-700 font-bold text-xs">My Comments / Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Write any comments for your teacher..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="rounded-xl resize-none text-xs"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl text-xs"
                onClick={() => setSubmitDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
              >
                {isSubmitting ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Submitting...</> : 'Submit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple Skeleton component
function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-slate-100 animate-pulse ${className}`} />;
}
