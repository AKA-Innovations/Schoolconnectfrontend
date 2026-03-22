'use client';

import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types/roles';

interface RoleGuardProps {
  roles: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const userRole = useAuthStore((state) => state.role);

  if (!userRole || !roles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
