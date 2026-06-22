'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudentSchedule } from '@/services/exam/queries';
import { CURRENT_SESSION } from '@/lib/constants';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function StudentExamSchedule() {
  const { data: schedules = [], isLoading } = useStudentSchedule(CURRENT_SESSION);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">My Exam Schedule</h2>
        <p className="text-sm text-muted-foreground mt-1">View your upcoming exams and timetables for session {CURRENT_SESSION}</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">Loading your exam schedule...</div>
      ) : schedules.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No upcoming exam schedules found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((exam: any) => (
            <Card key={exam.id} className="rounded-2xl overflow-hidden shadow-sm border-border bg-card">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className="bg-primary text-primary-foreground">Exam {exam.examId}</Badge>
                  <Badge variant="outline" className="bg-background uppercase font-bold text-[10px] tracking-wider">
                    {exam.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold">Subject {exam.subjectId}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="bg-muted p-2 rounded-lg"><Calendar className="h-5 w-5 text-foreground" /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</p>
                    <p className="font-semibold text-sm text-foreground">{new Date(exam.examDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="bg-muted p-2 rounded-lg"><Clock className="h-5 w-5 text-foreground" /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timing</p>
                    <p className="font-semibold text-sm text-foreground">{exam.startTime} - {exam.endTime}</p>
                  </div>
                </div>
                {exam.roomNo && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="bg-muted p-2 rounded-lg"><MapPin className="h-5 w-5 text-foreground" /></div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Room Assignment</p>
                      <p className="font-semibold text-sm text-foreground">Room {exam.roomNo}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
