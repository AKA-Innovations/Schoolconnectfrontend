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
  useUpdateSchoolClass,
  useDeleteSchoolClass,
  useSchoolSections, 
  useCreateSchoolSections,
  useUpdateSchoolSection,
  useDeleteSchoolSection
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
  const [selectedClassId, setSelectedClassId] = useState<number | string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editSectionValue, setEditSectionValue] = useState('');
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editClassValue, setEditClassValue] = useState('');

  const { data: classes = [], isLoading: classesLoading, refetch: refetchClasses } = useSchoolClasses();
  const { data: sections = [], isLoading: sectionsLoading, refetch: refetchSections } = useSchoolSections(
    selectedClassId ? Number(selectedClassId) : undefined
  );

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
        if (selectedClassId && String(selectedClassId) === String(id)) setSelectedClassId(null);
        refetchClasses();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed')
    });
  };

  const handleAddSection = () => {
    if (!selectedClassId || !newSectionName.trim()) return;
    createSectionMutation.mutate({ 
      sections: [{ classId: Number(selectedClassId), sectionName: newSectionName.trim() }] 
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

  const isClassSelected = (id: number | string) => {
    return selectedClassId !== null && String(selectedClassId) === String(id);
  };

  const activeClassObj = classes.find(c => String(c.id) === String(selectedClassId));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      
      {/* Left Column: Classes Master List */}
      <Card className="lg:col-span-6 erp-card h-fit border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-6 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold tracking-tight text-slate-800">School Classes</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-500 mt-0.5">Master registry of academic grades</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="rounded-lg font-bold text-xs bg-slate-100 text-slate-700 px-3 py-1">
              {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          
          {/* Add Class Input */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input 
                placeholder="e.g. Class 10, Grade 12..." 
                value={newClassName} 
                onChange={(e) => setNewClassName(e.target.value)}
                className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 text-sm font-semibold"
              />
            </div>
            <Button 
              onClick={handleAddClass} 
              disabled={createClassMutation.isPending || !newClassName.trim()}
              className="rounded-xl h-11 px-5 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform"
            >
              {createClassMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Class
            </Button>
          </div>

          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
            {classesLoading ? (
              <div className="py-16 text-center text-slate-400 font-semibold flex flex-col items-center justify-center">
                <Loader className="h-6 w-6 animate-spin text-primary mb-3" />
                <span>Loading classes...</span>
              </div>
            ) : classes.length === 0 ? (
              <div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-25 text-slate-600" />
                <p className="text-sm font-bold text-slate-700">No Classes Registered</p>
                <p className="text-xs text-slate-500 mt-1">Register a class using the input above.</p>
              </div>
            ) : (
              classes.map((cls) => {
                const isSelected = isClassSelected(cls.id);
                return (
                  <div 
                    key={cls.id}
                    onClick={() => !editingClassId && setSelectedClassId(cls.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                      isSelected 
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[0.99]" 
                        : "bg-slate-50/30 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                    )}
                  >
                    {editingClassId === cls.id ? (
                      <div className="flex items-center gap-2 flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                        <Input 
                          value={editClassValue} 
                          onChange={(e) => setEditClassValue(e.target.value)}
                          className="rounded-lg h-9 text-sm text-slate-800 font-semibold"
                          autoFocus
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-lg text-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleUpdateClass(cls.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-lg text-rose-500 hover:bg-rose-50"
                          onClick={() => setEditingClassId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3.5">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors",
                          isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          #
                        </div>
                        <span className="font-extrabold text-sm tracking-tight">{cls.className}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {editingClassId !== cls.id && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-8 w-8 rounded-lg transition-colors", 
                              isSelected 
                                ? "text-white/70 hover:text-white hover:bg-white/10" 
                                : "text-slate-400 hover:text-primary hover:bg-slate-100"
                            )}
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
                            className={cn(
                              "h-8 w-8 rounded-lg transition-colors", 
                              isSelected 
                                ? "text-white/70 hover:text-white hover:bg-white/10" 
                                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClass(cls.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                      <Badge className={cn(
                        "rounded-lg font-bold text-[10px] px-2 py-0.5", 
                        isSelected 
                          ? "bg-white/20 text-white border-transparent" 
                          : "bg-slate-100 text-slate-500 border-transparent"
                      )}>
                        ID: {cls.id}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Sections for selected class */}
      <Card className="lg:col-span-6 erp-card h-fit border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-6 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold tracking-tight text-slate-800">Class Sections</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-500 mt-0.5">
                  {selectedClassId ? `Assigned sections for ${activeClassObj?.className || ''}` : 'Select a class to view sections'}
                </CardDescription>
              </div>
            </div>
            {selectedClassId && (
              <Badge variant="secondary" className="rounded-lg font-bold text-xs bg-slate-100 text-slate-700 px-3 py-1">
                {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          
          {!selectedClassId ? (
            <div className="py-24 text-center text-slate-400 bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-200">
              <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-25 text-slate-600 animate-pulse" />
              <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Awaiting Class Selection</p>
              <p className="text-xs text-slate-500 mt-1">Please select a class from the list on the left to manage sections.</p>
            </div>
          ) : (
            <>
              {/* Add Section Input */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input 
                    placeholder="e.g. A, B, Rose, Lotus..." 
                    value={newSectionName} 
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 text-sm font-semibold"
                  />
                </div>
                <Button 
                  onClick={handleAddSection} 
                  disabled={createSectionMutation.isPending || !newSectionName.trim()}
                  variant="secondary"
                  className="rounded-xl h-11 px-5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform"
                >
                  {createSectionMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add Section
                </Button>
              </div>

              <div className="space-y-2.5">
                {sectionsLoading ? (
                  <div className="py-16 text-center text-slate-400 font-semibold flex flex-col items-center justify-center">
                    <Loader className="h-6 w-6 animate-spin text-secondary mb-3" />
                    <span>Loading sections...</span>
                  </div>
                ) : sections.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No sections defined yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">Add sections to this class grade level.</p>
                  </div>
                ) : (
                  sections.map((sec) => (
                    <div 
                      key={sec.id}
                      className="flex items-center justify-between p-4 bg-slate-50/30 border border-slate-100 rounded-2xl group hover:border-slate-200 hover:bg-slate-50/80 transition-all"
                    >
                      {editingSectionId === sec.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-4">
                          <Input 
                            value={editSectionValue} 
                            onChange={(e) => setEditSectionValue(e.target.value)}
                            className="rounded-lg h-9 text-sm text-slate-800 font-semibold"
                            autoFocus
                          />
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleUpdateSection(sec.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 rounded-lg text-rose-500 hover:bg-rose-50"
                            onClick={() => setEditingSectionId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                            <Layers className="h-4 w-4" />
                          </div>
                          <span className="font-extrabold text-sm tracking-tight text-slate-700">{sec.sectionName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors"
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
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
