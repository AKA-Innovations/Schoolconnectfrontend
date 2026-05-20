import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

export default function StudentReportCard() {
  const publishedReports = [
    { id: 1, session: '2026-27', term: 'First Term', percentage: 88.5, grade: 'A2', datePublished: '2026-10-01' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">My Report Cards</h2>
        <p className="text-sm text-muted-foreground mt-1">Access your academic performance records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedReports.map(report => (
          <Card key={report.id} className="rounded-2xl border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> {report.term}
              </CardTitle>
              <CardDescription>Session {report.session}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Percentage</p>
                  <p className="text-3xl font-black text-foreground">{report.percentage}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Grade</p>
                  <p className="text-2xl font-bold text-primary">{report.grade}</p>
                </div>
              </div>
              
              <Button className="w-full rounded-xl gap-2 font-semibold" variant="outline">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
