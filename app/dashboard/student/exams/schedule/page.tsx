import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

export default function StudentExamSchedule() {
  const upcomingExams = [
    { id: 1, subject: 'Mathematics', date: '2026-09-10', startTime: '09:00 AM', endTime: '12:00 PM', examName: 'First Term', type: 'Theory' },
    { id: 2, subject: 'Science', date: '2026-09-12', startTime: '09:00 AM', endTime: '12:00 PM', examName: 'First Term', type: 'Theory' },
    { id: 3, subject: 'English', date: '2026-09-14', startTime: '09:00 AM', endTime: '12:00 PM', examName: 'First Term', type: 'Theory' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">My Exam Schedule</h2>
        <p className="text-sm text-muted-foreground mt-1">View your upcoming exams and timetables</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingExams.map(exam => (
          <Card key={exam.id} className="rounded-2xl overflow-hidden shadow-sm border-border">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge className="bg-primary text-primary-foreground">{exam.examName}</Badge>
                <Badge variant="outline" className="bg-background">{exam.type}</Badge>
              </div>
              <CardTitle className="text-xl font-bold">{exam.subject}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-muted p-2 rounded-lg"><Calendar className="h-5 w-5 text-foreground" /></div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider">Date</p>
                  <p className="font-medium text-foreground">{exam.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-muted p-2 rounded-lg"><Clock className="h-5 w-5 text-foreground" /></div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider">Timing</p>
                  <p className="font-medium text-foreground">{exam.startTime} - {exam.endTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
