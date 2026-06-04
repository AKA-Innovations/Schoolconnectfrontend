'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  BookOpen, Plus, Trash2, ChevronDown, ChevronRight,
  Save, Loader2, GripVertical, Sparkles, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClassSectionLists, useSubjectOptions } from '@/hooks/useClasses';
import {
  useSubjectChapters, useSubjectTopics,
  useCreateChapter, useCreateTopic,
  useDeleteChapter, useDeleteTopic,
} from '@/hooks/useAcademic';
import { CURRENT_SESSION } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { SubjectChapter, SubjectTopic } from '@/services/academic/types';

/* ─── Draft row types ─────────────────────────────────────────────────────── */

interface DraftChapter {
  id: string; // temp client id
  chapterName: string;
}

interface DraftTopic {
  id: string;
  topicName: string;
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

let _uid = 0;
const uid = () => `draft-${++_uid}-${Date.now()}`;

/* ─── Main Component ──────────────────────────────────────────────────────── */

export function CurriculumBuilder() {
  // ── Selectors ──
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const { data: allClassSections = [] } = useClassSectionLists();
  const classes = useMemo(
    () => Array.from(new Set(allClassSections.map((c) => c.className))).sort(),
    [allClassSections],
  );
  const sections = useMemo(
    () =>
      selectedClass
        ? allClassSections.filter((c) => c.className === selectedClass).map((c) => c.sectionName).sort()
        : [],
    [selectedClass, allClassSections],
  );

  const { data: subjectOptions = [], isLoading: loadingSubjects } = useSubjectOptions(selectedClass);

  const selectedSubjectName = useMemo(
    () => subjectOptions.find((s) => String(s.id) === String(selectedSubjectId))?.subjectName ?? '',
    [subjectOptions, selectedSubjectId],
  );

  // ── Existing data ──
  const isReady = !!(selectedClass && selectedSubjectId);
  // Fetch chapters for the selected subject
  const { data: existingChapters = [], isLoading: loadingChapters, refetch: refetchChapters } =
    useSubjectChapters(isReady ? selectedSubjectId : undefined, CURRENT_SESSION);

  // The API already returns chapters for the selected subject, but filter as safety net
  const filteredChapters = useMemo(
    () => (Array.isArray(existingChapters) ? existingChapters : []).filter((c) => String(c.subjectId) === String(selectedSubjectId)),
    [existingChapters, selectedSubjectId],
  );

  // ── Draft chapters (bulk add) ──
  const [draftChapters, setDraftChapters] = useState<DraftChapter[]>([]);

  const addDraftChapter = () => setDraftChapters((prev) => [...prev, { id: uid(), chapterName: '' }]);
  const removeDraftChapter = (id: string) => setDraftChapters((prev) => prev.filter((d) => d.id !== id));
  const updateDraftChapter = (id: string, name: string) =>
    setDraftChapters((prev) => prev.map((d) => (d.id === id ? { ...d, chapterName: name } : d)));

  // ── Draft topics per chapter (keyed by chapterId) ──
  const [draftTopics, setDraftTopics] = useState<Record<number, DraftTopic[]>>({});
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  const toggleExpand = (chapterId: number) =>
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(chapterId) ? next.delete(chapterId) : next.add(chapterId);
      return next;
    });

  const addDraftTopic = (chapterId: number) => {
    setDraftTopics((prev) => ({
      ...prev,
      [chapterId]: [...(prev[chapterId] ?? []), { id: uid(), topicName: '' }],
    }));
    setExpandedChapters((prev) => new Set(prev).add(chapterId));
  };

  const removeDraftTopic = (chapterId: number, topicId: string) =>
    setDraftTopics((prev) => ({
      ...prev,
      [chapterId]: (prev[chapterId] ?? []).filter((t) => t.id !== topicId),
    }));

  const updateDraftTopic = (chapterId: number, topicId: string, name: string) =>
    setDraftTopics((prev) => ({
      ...prev,
      [chapterId]: (prev[chapterId] ?? []).map((t) => (t.id === topicId ? { ...t, topicName: name } : t)),
    }));

  // ── Existing topics (loaded per expanded chapter) ──
  const [loadedTopics, setLoadedTopics] = useState<Record<number, SubjectTopic[]>>({});

  // ── Mutations ──
  const createChapterMut = useCreateChapter();
  const createTopicMut = useCreateTopic();
  const deleteChapterMut = useDeleteChapter();
  const deleteTopicMut = useDeleteTopic();

  // ── Save all draft chapters ──
  const handleSaveChapters = async () => {
    const valid = draftChapters.filter((d) => d.chapterName.trim());
    if (valid.length === 0) { toast.error('Add at least one chapter name'); return; }

    if (!selectedSection) { toast.error('Please select a section to save'); return; }

    const startSeq = filteredChapters.length + 1;
    const chapterDetails = valid.map((d, i) => ({
      chapterName: d.chapterName.trim(),
      sequenceNo: startSeq + i,
    }));

    try {
      await createChapterMut.mutateAsync({
        session: CURRENT_SESSION,
        subjectId: Number(selectedSubjectId),
        chapters: chapterDetails,
      });
      setDraftChapters([]);
      toast.success(`${chapterDetails.length} chapter(s) added!`);
      refetchChapters();
    } catch {
      toast.error('Failed to save chapters');
    }
  };

  // ── Save draft topics for one chapter ──
  const handleSaveTopics = async (chapterId: number) => {
    const topics = (draftTopics[chapterId] ?? []).filter((t) => t.topicName.trim());
    if (topics.length === 0) { toast.error('Add at least one topic name'); return; }
    if (!selectedSection) { toast.error('Please select a section to save'); return; }

    const existingCount = (loadedTopics[chapterId] ?? []).length;
    const topicDetails = topics.map((t, i) => ({
      topicName: t.topicName.trim(),
      sequenceNo: existingCount + 1 + i,
    }));

    const chapter = filteredChapters.find((c) => c.id === chapterId);
    if (!chapter) return;

    try {
      // Send a single request for all topics
      await createTopicMut.mutateAsync({
        session: CURRENT_SESSION,
        subjectId: Number(selectedSubjectId),
        chapterId,
        topics: topicDetails,
      });

      setDraftTopics((prev) => ({ ...prev, [chapterId]: [] }));
      toast.success(`${topics.length} topic(s) added to "${chapter.chapterName}"!`);
      // Reload topics for this chapter
      loadTopicsForChapter(chapterId);
    } catch {
      toast.error('Failed to save topics');
    }
  };

  // ── Load topics when expanding a chapter ──
  const loadTopicsForChapter = useCallback(async (chapterId: number) => {
    try {
      const { academicService } = await import('@/services/academic.service');
      const topics = await academicService.getSubjectTopics(chapterId, selectedSubjectId, CURRENT_SESSION);
      setLoadedTopics((prev) => ({ ...prev, [chapterId]: topics }));
    } catch {
      // silent fail
    }
  }, [selectedSubjectId]);

  const handleToggleChapter = (chapterId: number) => {
    toggleExpand(chapterId);
    if (!expandedChapters.has(chapterId) && !loadedTopics[chapterId]) {
      loadTopicsForChapter(chapterId);
    }
  };

  // ── Reset on selector change ──
  const handleClassChange = (v: string) => {
    setSelectedClass(v);
    setSelectedSection('');
    setSelectedSubjectId('');
    setDraftChapters([]);
    setDraftTopics({});
    setExpandedChapters(new Set());
    setLoadedTopics({});
  };

  const handleSubjectChange = (v: string) => {
    setSelectedSubjectId(v);
    setDraftChapters([]);
    setDraftTopics({});
    setExpandedChapters(new Set());
    setLoadedTopics({});
  };

  // ── Handle Enter key in chapter inputs ──
  const handleChapterKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === draftChapters.length - 1) {
        addDraftChapter();
      }
      // Focus next input after render
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>('[data-draft-chapter]');
        inputs[index + 1]?.focus();
      }, 50);
    }
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent, chapterId: number, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const topics = draftTopics[chapterId] ?? [];
      if (index === topics.length - 1) {
        addDraftTopic(chapterId);
      }
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>(`[data-draft-topic="${chapterId}"]`);
        inputs[index + 1]?.focus();
      }, 50);
    }
  };

  const isPending = createChapterMut.isPending || createTopicMut.isPending;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Curriculum Builder</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900/80">
          Chapters <span className="text-slate-400 font-light">& Topics</span>
        </h1>
        <p className="text-sm text-slate-500 max-w-lg">
          Select a class and subject, then add chapters and topics inline. Press <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 rounded font-mono">Enter</kbd> to add more rows quickly.
        </p>
      </div>

      {/* ─── Selectors ───────────────────────────────────────────── */}
      <Card className="border-none bg-white/60 backdrop-blur-md shadow-xl shadow-slate-200/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="field-label">Class <span className="text-rose-500 ml-0.5">*</span></label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
              >
                <option value="">Select Class</option>
                {classes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Section <span className="text-rose-500 ml-0.5">*</span></label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-40"
              >
                <option value="">Select Section</option>
                {sections.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Subject <span className="text-rose-500 ml-0.5">*</span></label>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={!selectedClass || loadingSubjects}
                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-40"
              >
                <option value="">{loadingSubjects ? 'Loading…' : 'Select Subject'}</option>
                {subjectOptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.subjectName} ({sub.subjectCode})</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Content area ────────────────────────────────────────── */}
      {!isReady ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-5">
            <BookOpen className="h-10 w-10 text-slate-200" />
          </div>
          <h3 className="text-lg font-semibold text-slate-400">Select Class, Section & Subject</h3>
          <p className="text-sm text-slate-400 mt-1">to start building your curriculum</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-teal-50 text-teal-700 border-teal-100 px-3 py-1.5 text-xs font-bold">
                Class {selectedClass}
              </Badge>
              {selectedSection && (
                <Badge variant="outline" className="text-[10px] font-bold border-slate-200">
                  Section {selectedSection}
                </Badge>
              )}
              <span className="text-lg font-bold text-slate-800">{selectedSubjectName}</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {filteredChapters.length} chapter{filteredChapters.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Existing Chapters ── */}
          {loadingChapters ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-50/50 rounded-2xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChapters.map((chapter) => {
                const isExpanded = expandedChapters.has(chapter.id);
                const topics = loadedTopics[chapter.id] ?? [];
                const drafts = draftTopics[chapter.id] ?? [];

                return (
                  <div key={chapter.id} className="group rounded-2xl border border-slate-100 bg-white overflow-hidden transition-all hover:shadow-md hover:shadow-slate-100/50">
                    {/* Chapter row */}
                    <div
                      className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
                      onClick={() => handleToggleChapter(chapter.id)}
                    >
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {chapter.sequenceNo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{chapter.chapterName}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {topics.length > 0 ? `${topics.length} topic${topics.length !== 1 ? 's' : ''}` : 'Click to add topics'}
                        </span>
                      </div>
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 px-2 rounded-lg text-[10px] font-bold text-teal-600 hover:bg-teal-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); addDraftTopic(chapter.id); }}
                      >
                        <Plus size={12} className="mr-1" /> ADD TOPICS
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChapterMut.mutate(chapter.id, {
                            onSuccess: () => { toast.success('Chapter deleted'); refetchChapters(); },
                          });
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                      {isExpanded ? <ChevronDown size={16} className="text-slate-300" /> : <ChevronRight size={16} className="text-slate-300" />}
                    </div>

                    {/* Expanded topics */}
                    {isExpanded && (
                      <div className="border-t border-slate-50 bg-slate-50/30 px-5 py-3 space-y-2">
                        {/* Existing topics */}
                        {topics.map((topic) => (
                          <div key={topic.id} className="flex items-center gap-3 py-1.5 pl-12 group/topic">
                            <div className="h-6 w-6 rounded-lg bg-slate-200/60 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {topic.sequenceNo}
                            </div>
                            <span className="text-sm text-slate-700 flex-1">{topic.topicName}</span>
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 rounded-lg text-rose-400 hover:bg-rose-50 opacity-0 group-hover/topic:opacity-100 transition-opacity"
                              onClick={() => deleteTopicMut.mutate(topic.id, {
                                onSuccess: () => { toast.success('Topic deleted'); loadTopicsForChapter(chapter.id); },
                              })}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        ))}

                        {/* Draft topic inputs */}
                        {drafts.map((draft, idx) => (
                          <div key={draft.id} className="flex items-center gap-2 pl-12">
                            <div className="h-6 w-6 rounded-lg bg-teal-100/60 flex items-center justify-center text-[10px] font-bold text-teal-600">
                              {(topics.length) + idx + 1}
                            </div>
                            <input
                              data-draft-topic={chapter.id}
                              autoFocus={idx === drafts.length - 1}
                              value={draft.topicName}
                              onChange={(e) => updateDraftTopic(chapter.id, draft.id, e.target.value)}
                              onKeyDown={(e) => handleTopicKeyDown(e, chapter.id, idx)}
                              placeholder={`Topic ${topics.length + idx + 1} name…`}
                              className="flex-1 h-9 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all placeholder:text-slate-300"
                            />
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-500"
                              onClick={() => removeDraftTopic(chapter.id, draft.id)}>
                              <X size={14} />
                            </Button>
                          </div>
                        ))}

                        {/* Actions row */}
                        <div className="flex items-center gap-2 pl-12 pt-1">
                          <Button variant="ghost" size="sm"
                            className="h-8 rounded-lg text-[11px] font-bold text-slate-500 hover:text-teal-600 hover:bg-teal-50"
                            onClick={() => addDraftTopic(chapter.id)}>
                            <Plus size={12} className="mr-1" /> Add topic
                          </Button>
                          {drafts.length > 0 && (
                            <Button size="sm"
                              className="h-8 rounded-lg text-[11px] font-bold bg-teal-600 hover:bg-teal-700"
                              disabled={createTopicMut.isPending}
                              onClick={() => handleSaveTopics(chapter.id)}>
                              {createTopicMut.isPending
                                ? <Loader2 size={12} className="mr-1 animate-spin" />
                                : <Save size={12} className="mr-1" />}
                              Save {drafts.filter((t) => t.topicName.trim()).length} topic(s)
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Draft Chapters (bulk add area) ── */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Plus size={16} className="text-teal-500" />
                Add New Chapters
              </h3>
              {draftChapters.length > 0 && (
                <span className="text-[10px] text-slate-400 font-medium">
                  Press Enter for next row
                </span>
              )}
            </div>

            {draftChapters.length === 0 ? (
              <button
                onClick={addDraftChapter}
                className="w-full py-4 rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 font-medium hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/30 transition-all"
              >
                + Click to start adding chapters
              </button>
            ) : (
              <>
                <div className="space-y-2">
                  {draftChapters.map((draft, idx) => (
                    <div key={draft.id} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">
                        {filteredChapters.length + idx + 1}
                      </div>
                      <input
                        data-draft-chapter
                        autoFocus={idx === draftChapters.length - 1}
                        value={draft.chapterName}
                        onChange={(e) => updateDraftChapter(draft.id, e.target.value)}
                        onKeyDown={(e) => handleChapterKeyDown(e, idx)}
                        placeholder={`Chapter ${filteredChapters.length + idx + 1} name…`}
                        className="flex-1 h-11 px-4 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all placeholder:text-slate-300 font-medium"
                      />
                      <Button variant="ghost" size="icon"
                        className="h-9 w-9 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 shrink-0"
                        onClick={() => removeDraftChapter(draft.id)}>
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button variant="outline" size="sm"
                    className="h-9 rounded-xl text-xs font-bold border-slate-200"
                    onClick={addDraftChapter}>
                    <Plus size={14} className="mr-1" /> Add row
                  </Button>
                  <Button size="sm"
                    className="h-9 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200/30"
                    disabled={createChapterMut.isPending}
                    onClick={handleSaveChapters}>
                    {createChapterMut.isPending
                      ? <Loader2 size={14} className="mr-1.5 animate-spin" />
                      : <Save size={14} className="mr-1.5" />}
                    Save {draftChapters.filter((d) => d.chapterName.trim()).length} chapter(s)
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
