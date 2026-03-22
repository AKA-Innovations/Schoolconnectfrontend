'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { GraduationCap, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For demo/dev purposes, check against mock credentials
      // But we'll call a mock API or real API
      const isDev = true; // Hardcoded for now, can be env
      
      let data;
      if (isDev) {
        // Mock success response based on user role hints in username
        // e.g. admin@erp.com -> school_admin
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let role: any = 'school_admin';
        if (username.includes('principal')) role = 'principal';
        if (username.includes('teacher')) role = 'teacher';
        if (username.includes('coordinator')) role = 'subject_coordinator';
        if (username.includes('super')) role = 'super_admin';

        data = {
          accessToken: 'mock-token-' + Math.random().toString(36).substr(2),
          role: role,
          username: username,
          name: username.split('@')[0],
          schoolId: 'school-123'
        };
      } else {
        const response = await api.post('/auth/login/super-admin', { username, password });
        data = response.data;
      }

      // Save to store
      setAuth({
        user: {
          id: 'user-' + Math.random().toString(36).substr(2),
          name: data.name || data.username,
          username: data.username,
          role: data.role,
          schoolId: data.schoolId,
        },
        token: data.accessToken,
      });

      // Also set cookies for middleware (simple way)
      document.cookie = `auth-token=${data.accessToken}; path=/`;
      document.cookie = `user-role=${data.role}; path=/`;

      // Redirect based on role
      const roleRedirects: Record<string, string> = {
        super_admin: '/dashboard/admin',
        school_admin: '/dashboard/admin',
        principal: '/dashboard/principal',
        teacher: '/dashboard/teacher',
        subject_coordinator: '/dashboard/coordinator',
      };

      router.push(roleRedirects[data.role] || '/dashboard/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-primary" />
      
      <Card className="w-full max-w-md shadow-card border-border">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">SkoolConnect</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to access your dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Email or Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="admin@school.com" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/5 p-2 rounded border border-destructive/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center space-y-2">
            <p className="text-xs text-muted-foreground">Quick Login (Dev Mode):</p>
            <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => { setUsername('admin@test.com'); setPassword('password'); }} className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded">Admin</button>
               <button onClick={() => { setUsername('principal@test.com'); setPassword('password'); }} className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded">Principal</button>
               <button onClick={() => { setUsername('teacher@test.com'); setPassword('password'); }} className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded">Teacher</button>
               <button onClick={() => { setUsername('coordinator@test.com'); setPassword('password'); }} className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded">Coordinator</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
