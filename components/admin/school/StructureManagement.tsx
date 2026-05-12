'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  useSchoolClasses, 
  useCreateSchoolClasses, 
  useSchoolSections, 
  useCreateSchoolSections,
  useUpdateSchoolSection 
} from '@/hooks/useClasses';
import { 
  Plus, 
  Trash2, 
  LayoutGrid, 
  Hash, 
  Layers, 
  Loader, 
  Check, 
  X,
  Pencil,
  Building2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function StructureManagement() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editSectionValue, setEditSectionValue] = useState('');
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editClassValue, setEditClassValue] = useState('');

  const { data: classes = [], isLoading: classesLoading, refetch: refetchClasses } = useSchoolClasses();
  const { data: sections = [], isLoading: sectionsLoading, refetch: refetchSections } = useSchoolSections(selectedClassId ?? undefined);

  const createClassMutation = useCreateSchoolClasses();
  const updateClassMutation = useUpdateSchoolClass();
  const deleteClassMutation = useDeleteSchoolClass();
  
  const createSectionMutation = useCreateSchoolSections();
  const updateSectionMutation = useUpdateSchoolSection();
  const deleteSectionMutation = useDeleteSchoolSection();

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    createClassMutation.mutate({ classes: [{ className: newClassName.trim() }] }, {
      onSuccess: () => {
        setNewClassName('');
        toast.success('Class added to master list');
        refetchClasses();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add class')
    });
  };

  const handleUpdateClass = (id: number) => {
    if (!editClassValue.trim()) return;
    updateClassMutation.mutate({ id, className: editClassValue.trim() }, {
      onSuccess: () => {
        setEditingClassId(null);
        toast.success('Class updated');
        refetchClasses();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed')
    });
  };

  const handleDeleteClass = (id: number) => {
    if (!confirm('Delete this class and all its sections? This action cannot be undone.')) return;
    deleteClassMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Class deleted');
        if (selectedClassId === id) setSelectedClassId(null);
        refetchClasses();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed')
    });
  };

  const handleAddSection = () => {
    if (!selectedClassId || !newSectionName.trim()) return;
    createSectionMutation.mutate({ 
      sections: [{ classId: selectedClassId, sectionName: newSectionName.trim() }] 
    }, {
      onSuccess: () => {
        setNewSectionName('');
        toast.success('Section added to class');
        refetchSections();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add section')
    });
  };

  const handleUpdateSection = (id: number) => {
    if (!editSectionValue.trim()) return;
    updateSectionMutation.mutate({ id, data: { sectionName: editSectionValue.trim() } }, {
      onSuccess: () => {
        setEditingSectionId(null);
        toast.success('Section updated');
        refetchSections();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed')
    });
  };

  const handleDeleteSection = (id: number) => {
    if (!confirm('Delete this section?')) return;
    deleteSectionMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Section deleted');
        refetchSections();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed')
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      
      {/* Left Column: Classes Master List */}
      <Card className="erp-card h-fit">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">School Classes</CardTitle>
                <CardDescription className="text-xs font-medium opacity-70">Master list of grade levels</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="rounded-lg">{classes.length} Classes</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          
          {/* Add Class Input */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input 
                placeholder="e.g., Class 1, Grade 10..." 
                value={newClassName} 
                onChange={(e) => setNewClassName(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <Button 
              onClick={handleAddClass} 
              disabled={createClassMutation.isPending || !newClassName.trim()}
              className="rounded-xl h-11 px-6 font-bold text-xs uppercase tracking-widest"
            >
              {createClassMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Class
            </Button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {classesLoading ? (
              <div className="py-12 text-center text-muted-foreground"><Loader className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...</div>
            ) : classes.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">No classes defined yet</p>
              </div>
            ) : (
              classes.map((cls) => (
                <div 
                  key={cls.id}
                  onClick={() => !editingClassId && setSelectedClassId(cls.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                    selectedClassId === cls.id 
                      ? "bg-primary border-primary text-primary-foreground shadow-md" 
                      : "bg-muted/10 border-border/50 hover:bg-muted/30 hover:border-border"
                  )}
                >
                  {editingClassId === cls.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                      <Input 
                        value={editClassValue} 
                        onChange={(e) => setEditClassValue(e.target.value)}
                        className="rounded-lg h-8 text-sm text-foreground"
                        autoFocus
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg text-success hover:bg-success/20"
                        onClick={() => handleUpdateClass(cls.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/20"
                        onClick={() => setEditingClassId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Hash className={cn("h-4 w-4", selectedClassId === cls.id ? "text-primary-foreground/60" : "text-primary/40")} />
                      <span className="font-bold tracking-tight">{cls.className}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {editingClassId !== cls.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("h-8 w-8 rounded-lg", selectedClassId === cls.id ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-primary")}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingClassId(cls.id);
                            setEditClassValue(cls.className);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("h-8 w-8 rounded-lg", selectedClassId === cls.id ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-destructive")}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(cls.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    <Badge className={cn("rounded-lg font-bold", selectedClassId === cls.id ? "bg-white/20 text-white border-white/20" : "bg-primary/10 text-primary border-primary/20")}>
                      ID: {cls.id}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Sections for selected class */}
      <Card className="erp-card h-fit">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Class Sections</CardTitle>
                <CardDescription className="text-xs font-medium opacity-70">
                  {selectedClassId ? `Sections for ${classes.find(c => c.id === selectedClassId)?.className}` : 'Select a class to view sections'}
                </CardDescription>
              </div>
            </div>
            {selectedClassId && <Badge variant="secondary" className="rounded-lg">{sections.length} Sections</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          
          {!selectedClassId ? (
            <div className="py-20 text-center text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed">
              <LayoutGrid className="h-10 w-10 mx-auto mb-4 opacity-10" />
              <p className="text-sm font-bold uppercase tracking-widest opacity-40">Awaiting Class Selection</p>
            </div>
          ) : (
            <>
              {/* Add Section Input */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input 
                    placeholder="e.g., A, B, Rose, Lotus..." 
                    value={newSectionName} 
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
                <Button 
                  onClick={handleAddSection} 
                  disabled={createSectionMutation.isPending || !newSectionName.trim()}
                  variant="secondary"
                  className="rounded-xl h-11 px-6 font-bold text-xs uppercase tracking-widest"
                >
                  {createSectionMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add Section
                </Button>
              </div>

              <div className="space-y-3">
                {sectionsLoading ? (
                  <div className="py-12 text-center text-muted-foreground"><Loader className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...</div>
                ) : sections.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/5">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">No sections defined</p>
                  </div>
                ) : (
                  sections.map((sec) => (
                    <div 
                      key={sec.id}
                      className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-2xl group hover:border-secondary/40 transition-all"
                    >
                      {editingSectionId === sec.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-4">
                          <Input 
                            value={editSectionValue} 
                            onChange={(e) => setEditSectionValue(e.target.value)}
                            className="rounded-lg h-8 text-sm"
                            autoFocus
                          />
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 rounded-lg text-success"
                            onClick={() => handleUpdateSection(sec.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 rounded-lg text-destructive"
                            onClick={() => setEditingSectionId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                            {sec.sectionName.charAt(0)}
                          </div>
                          <span className="font-bold text-sm tracking-tight">{sec.sectionName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setEditingSectionId(sec.id);
                            setEditSectionValue(sec.sectionName);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteSection(sec.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
