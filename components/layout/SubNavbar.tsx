'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useTeacherRoles } from '../../lib/permissions';
import { getSidebarLinks, isLinkActive } from '../../lib/navigation';

export function SubNavbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useAuthStore();
  const teacherRoles = useTeacherRoles();

  // Find the active main section using role and teacherRoles dynamic links
  const activeSection = React.useMemo(() => {
    if (!role) return null;
    const links = getSidebarLinks(role, teacherRoles);
    const currentParams = new URLSearchParams(searchParams?.toString());
    
    return links.find(link => isLinkActive(link, pathname || '', currentParams));
  }, [role, pathname, searchParams, teacherRoles]);

  // Filter sub-links based on teacher roles
  const subLinks = React.useMemo(() => {
    if (!activeSection?.subLinks) return [];
    return activeSection.subLinks.filter(sub => {
      if (!sub.requiresTeacherRole) return true;
      return teacherRoles[sub.requiresTeacherRole];
    });
  }, [activeSection, teacherRoles]);

  if (subLinks.length === 0) return null;

  return (
    <div className="w-full bg-background/60 backdrop-blur-md border-b sticky top-16 z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12 gap-8 overflow-x-auto no-scrollbar">
          {subLinks.map((sub) => {
            const [subPath, subQuery] = sub.href.split('?');
            let isActive = pathname === subPath;
            
            if (subQuery) {
              const params = new URLSearchParams(subQuery);
              const allParamsMatch = Array.from(params.entries()).every(([key, value]) => 
                searchParams.get(key) === value
              );
              isActive = isActive && allParamsMatch;
            }
            
            return (
              <Link
                key={sub.href}
                href={sub.href}
                className={cn(
                  'relative h-full flex items-center text-xs font-semibold tracking-wide uppercase transition-all duration-300 whitespace-nowrap',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {sub.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(13,148,136,0.3)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
