'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSchoolClasses, useSchoolSections } from '@/hooks/useClasses';
import { Users, BookOpen, Loader } from 'lucide-react';

export function ClassSectionExplorer() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const { data: classes = [], isLoading: classesLoading } = useSchoolClasses();
  const { data: sections = [], isLoading: sectionsLoading } = useSchoolSections(selectedClassId ?? undefined);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Auto-select first class on load
  React.useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Class & Section Explorer</h2>
        <p className="text-sm text-muted-foreground mt-1">Browse classes and their sections</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Classes List */}
        <Card className="erp-card overflow-hidden lg:col-span-1 h-fit">
          <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8">
            <CardTitle className="text-lg font-bold tracking-tight">Classes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {classesLoading ? (
              <div className="p-6 text-center">
                <Loader className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
              </div>
            ) : classes.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No classes found</div>
            ) : (
              <div className="space-y-1 p-4">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                      selectedClassId === cls.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cls.className}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Sections and Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Class Summary Card */}
          {selectedClass && (
            <Card className="rounded-2xl border-border shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">{selectedClass.className}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {sections.length} section{sections.length !== 1 ? 's' : ''} in this class
                    </p>
                  </div>
                  <BookOpen className="h-12 w-12 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sections Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight">Sections</h3>
            {sectionsLoading ? (
              <div className="text-center py-12">
                <Loader className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
              </div>
            ) : sections.length === 0 ? (
              <Card className="rounded-2xl border-border shadow-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No sections found for this class</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section) => (
                  <Card key={section.id} className="rounded-2xl border-border shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Section Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-foreground">
                              Section {section.sectionName}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {section.className} – {section.sectionName}
                            </p>
                          </div>
                          <Badge className="bg-blue-500/10 text-blue-600 border-0">
                            Master
                          </Badge>
                        </div>

                        {/* Section Details */}
                        <div className="space-y-3 pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground italic">
                            This is a master section. Use Classes Overview to configure limits and teachers.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

