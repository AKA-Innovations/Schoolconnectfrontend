'use client';

import React, { useEffect, useState } from 'react';
import { eventTypeService } from '@/services/event-type/service';
import type { EventType } from '@/services/event/types';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Plus, Trash2, RotateCw, Tag, ToggleLeft, ToggleRight, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function EventTypeManager() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTypeName, setNewTypeName] = useState('');
  const [creating, setCreating] = useState(false);
  const [session] = useState(CURRENT_SESSION);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const types = await eventTypeService.listEventTypes(session);
      setEventTypes(Array.isArray(types) ? types : []);
    } catch (err) {
      toast.error('Failed to load event types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, [session]);

  const handleCreate = async () => {
    if (!newTypeName.trim()) {
      toast.error('Please enter a type name');
      return;
    }
    setCreating(true);
    try {
      await eventTypeService.createEventType({ session, name: newTypeName.trim().toUpperCase() });
      toast.success('Event type created successfully');
      setNewTypeName('');
      fetchTypes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create event type');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event type?')) return;
    try {
      await eventTypeService.deleteEventType(id);
      toast.success('Event type deleted');
      fetchTypes();
    } catch (err) {
      toast.error('Failed to delete event type');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Event Types</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage event categories for your school</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchTypes}
          disabled={loading}
          className="rounded-xl"
        >
          <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Create new type */}
      <Card className="border border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter new event type name (e.g. SEMINAR)"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="flex-1 h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring uppercase"
            />
            <Button onClick={handleCreate} disabled={creating} className="rounded-xl flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {creating ? 'Creating...' : 'Add Type'}
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : eventTypes.length === 0 ? (
        <Card className="border border-dashed border-border/80">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">No Event Types</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first event type to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {eventTypes.map((et) => (
            <div
              key={et.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                et.isActive
                  ? 'bg-card border-border/60 hover:shadow-sm'
                  : 'bg-muted/30 border-border/30 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${et.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="font-bold text-sm tracking-wider uppercase text-foreground">{et.name}</span>
                {!et.isActive && (
                  <Badge variant="secondary" className="text-[10px] rounded-lg">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(et.id)}
                  className="rounded-xl text-muted-foreground hover:text-rose-600"
                  title="Delete Event Type"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
