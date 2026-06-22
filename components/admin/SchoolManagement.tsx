'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchool } from '@/hooks/useSchool';
import { useAuthStore } from '@/store/authStore';
import { Building2, MapPin, Mail, Phone, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SchoolImageSection } from '@/components/admin/school/SchoolImageSection';
import { SchoolDetailsForm } from '@/components/admin/school/SchoolDetailsForm';
import { ContactForm } from '@/components/admin/school/ContactForm';
import { OwnerForm } from '@/components/admin/school/OwnerForm';
import { AdministratorForm } from '@/components/admin/school/AdministratorForm';
import { StructureManagement } from '@/components/admin/school/StructureManagement';

export function SchoolManagement() {
  const { schoolId, user } = useAuthStore();
  const { data: school, isLoading, isFetching, refetch } = useSchool(schoolId);
  const [activeTab, setActiveTab] = useState('school');

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 rounded-2xl bg-muted" />
        <div className="h-96 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-xl font-bold">School Not Found</h3>
        <p className="text-muted-foreground mt-2">Could not load school data.</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Header card */}
      <Card className="erp-card overflow-hidden">
        <div className="relative p-6 sm:p-8 bg-card flex flex-col md:flex-row items-center md:items-start gap-6">
          <SchoolImageSection school={school} />
          <div className="flex-1 text-center md:text-left space-y-1.5">
            <span className="inline-block bg-muted/30 text-muted-foreground px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border border-border/40">
              {school.schoolCode}
            </span>
            <h1 className="text-2xl font-bold tracking-tight">{school.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-muted-foreground/70 mt-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <MapPin className="h-3.5 w-3.5 opacity-40 text-primary" />
                {school.city}, {school.state}, {school.country}
              </span>
              {school.contactDetails?.email && (
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <Mail className="h-3.5 w-3.5 opacity-40 text-primary" />{school.contactDetails.email}
                </span>
              )}
              {school.contactDetails?.phone && (
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <Phone className="h-3.5 w-3.5 opacity-40 text-primary" />{school.contactDetails.phone}
                </span>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <Button variant="secondary" size="icon" onClick={() => refetch()}
              className="rounded-xl h-10 w-10 shadow-sm border border-border/50 bg-background/50 hover:bg-background" title="Refresh">
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-max min-w-full gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border/50">
          {[
            { id: 'school',  label: 'School Details' },
            { id: 'contact', label: 'Contact'         },
            { id: 'owner',   label: 'Owner'           },
            { id: 'admin',   label: 'Administrator'   },
            { id: 'structure', label: 'Structure'     },
          ].map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}
              className="rounded-xl px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-6">
          <TabsContent value="school"  className="mt-0"><SchoolDetailsForm  school={school} /></TabsContent>
          <TabsContent value="contact" className="mt-0"><ContactForm        school={school} /></TabsContent>
          <TabsContent value="owner"   className="mt-0"><OwnerForm          school={school} /></TabsContent>
          <TabsContent value="admin"   className="mt-0"><AdministratorForm  adminId={user?.id} schoolId={schoolId} /></TabsContent>
          <TabsContent value="structure" className="mt-0"><StructureManagement /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

