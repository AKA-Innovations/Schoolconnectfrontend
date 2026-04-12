'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { 
  GraduationCap, 
  Loader2, 
  BookOpen, 
  Users, 
  BarChart3, 
  Shield,
  ChevronRight,
  Sparkles,
  Calendar,
  MessageSquare,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import api from '../../lib/api';
import { teacherService } from '../../services/teacher.service';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const ROLE_REDIRECT: Record<string, string> = {
    super_admin: '/dashboard/admin',
    school_admin: '/dashboard/admin',
    principal: '/dashboard/principal',
    teacher: '/dashboard/teacher',
    subject_coordinator: '/dashboard/coordinator',
    student: '/dashboard/student',
  };

  const parseJwt = (token: string): any | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
      let data: { accessToken: string; role: string; username: string; userId?: string; schoolId?: string | null };

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const role = username.includes('principal') ? 'principal' : username.includes('teacher') ? 'teacher' : 'school_admin';
        data = {
          accessToken: `mock-token-${Math.random().toString(36).slice(2)}`,
          role,
          username,
          userId: `mock-user-${Math.random().toString(36).slice(2)}`,
          schoolId: 'school-123',
        };
      } else {
        const response = await api.post('/auth/login', { username, password });
        data = response.data;
      }

      // Prefer authoritative schoolId and userId from JWT payload (backend embeds them in token)
      const payload = parseJwt(data.accessToken);
      const tokenSchoolId = payload?.schoolId ?? null;
      const backendUserId = payload?.sub;

      // Build base user object
      const userObj: any = {
        id: backendUserId ?? data.userId ?? `user-${Math.random().toString(36).slice(2)}`,
        name: data.username,
        username: data.username,
        role: data.role as any,
        schoolId: tokenSchoolId ?? undefined,
      };

      // Set auth immediately so the API interceptor has the token for subsequent calls
      setAuth({ user: userObj, token: data.accessToken });
      document.cookie = `auth-token=${data.accessToken}; path=/; SameSite=Strict`;
      document.cookie = `user-role=${data.role}; path=/; SameSite=Strict`;

      // If teacher or subject_coordinator, enrich auth store with sub-role flags
      if ((data.role === 'teacher' || data.role === 'subject_coordinator') && backendUserId) {
        try {
          const teacherDetails = await teacherService.getTeacherById(backendUserId);
          const assignedClass = teacherDetails.classTeacherAssignment ?? null;
          const coordinatorClasses = (teacherDetails.coordinatorMappings ?? []).map((m) => m.className);
          setAuth({
            user: {
              ...userObj,
              isPrincipal: teacherDetails.isPrincipal ?? false,
              isCoordinator: teacherDetails.isCoordinator ?? false,
              isClassTeacher: teacherDetails.isClassTeacher ?? false,
              isSubjectTeacher: teacherDetails.isSubjectTeacher ?? false,
              classTeacherClass: assignedClass
                ? { className: assignedClass.className, sectionName: assignedClass.sectionName }
                : null,
              coordinatorClasses: coordinatorClasses.length > 0 ? coordinatorClasses : undefined,
            },
            token: data.accessToken,
          });
        } catch (err) {
          // Non-critical: proceed with basic auth even if enrichment fails
          console.warn('Failed to fetch teacher details for role enrichment:', err);
        }
      }

      const redirect = ROLE_REDIRECT[data.role] ?? '/dashboard/admin';
      router.push(redirect);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Users, title: 'Student Management', description: 'Centralized student records' },
    { icon: Calendar, title: 'Academic Calendar', description: 'Smart scheduling & events' },
    { icon: BarChart3, title: 'Insightful Analytics', description: 'Performance tracking' },
    { icon: MessageSquare, title: 'Parent Portal', description: 'Direct communication' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row flex-1">
        
        {/* LEFT SIDE: Branding & Value Prop */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
          <div className="max-w-xl mx-auto lg:mx-0">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 group">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 leading-none">SkoolConnect</h1>
                <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600">Enterprise Edition</span>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Managing education <br />
                <span className="text-blue-600">made simple.</span>
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                The all-in-one platform designed to empower educators and inspire students through seamless administration.
              </p>

              {/* Responsive Feature List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 max-lg:hidden">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1 w-5 h-5 text-blue-500 shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{f.title}</h4>
                      <p className="text-xs text-slate-500">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-10 lg:bg-white/40 lg:backdrop-blur-sm lg:border-l border-slate-200">
          <Card  className="cardprime w-full max-w-105 rounded-[40px] border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white p-2">
            <CardHeader className="space-y-1 text-center pb-8">
              <CardTitle className="text-2xl font-bold text-slate-900">Dashboard Login</CardTitle>
              <CardDescription className="text-slate-500">Enter your official credentials below</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 font-medium">Username</Label>
                  <Input 
                    id="username"
                    placeholder="john.doe@school.edu"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-blue-500 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                    <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                      Reset Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-10 border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-blue-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 animate-in fade-in zoom-in-95">
                    <Shield className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button 
                  disabled={isLoading}
                  className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                  ) : (
                    <><span className="mr-1">Access Dashboard</span> <ChevronRight size={18} /></>
                  )}
                </Button>
              </form>

              {/* Dev Helper - Only visible in DEV_MODE */}
              {process.env.NEXT_PUBLIC_DEV_MODE === 'true' && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 text-center mb-4">Quick Auth (Dev)</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['admin', 'teacher'].map((role) => (
                      <button
                        key={role}
                        onClick={() => { setUsername(`${role}@test.com`); setPassword('password'); }}
                        className="px-4 py-2 text-xs rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium capitalize"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 py-6 border-t border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-[13px] font-medium text-slate-400">
            <span>© 2026 SkoolConnect</span>
            <div className="flex items-center gap-1.5 border-l pl-6 border-slate-200">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-slate-500">Secure AES-256 Encryption</span>
            </div>
          </div>
          <nav className="flex gap-8 text-[13px] font-semibold text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}