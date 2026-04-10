# SkoolConnect ERP Frontend

A production-grade Next.js 14 ERP frontend with role-based dashboards, authentication, and full performance optimization.

## 🚀 Features

- **Role-Based Access Control**: Separate dashboards for Admin, Principal, Teacher, and Coordinator.
- **Middleware Protection**: Secure routes based on authentication and user roles.
- **State Management**: Persistent auth state with Zustand.
- **Data Fetching**: Optimized data fetching and caching using React Query.
- **Premium UI**: Modern, responsive design using Tailwind CSS and shadcn/ui patterns.
- **Mock Mode**: Fully functional UI with mock data for development.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: Zustand (with Persist)
- **Data Fetching**: TanStack React Query v5
- **Forms**: React Hook Form + Zod
- **API Client**: Axios

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Role-Based Login (Dev Mode)

Use these identifiers in the username field to test different roles:
- **Admin**: `admin@school.com`
- **Principal**: `principal@school.com`
- **Teacher**: `teacher@school.com`
- **Coordinator**: `coordinator@school.com`

Any password will work in Dev Mode.

## 🛡️ Role Mapping

| Role | Route | Key Features |
|------|-------|--------------|
| `school_admin` | `/dashboard/admin` | Schools, Users, Reports, Billing |
| `principal` | `/dashboard/principal` | Teachers, Students, Timetable, Announcements |
| `teacher` | `/dashboard/teacher` | Classes, Attendance, Assignments, Grades |
| `subject_coordinator` | `/dashboard/coordinator` | Subjects, Curriculum, Assessments |

## ⚡ Performance Optimizations

1. **React Query**: `staleTime` set to 5 mins, `gcTime` to 10 mins.
2. **Debouncing**: Search inputs use `useDebounce` (500ms) to reduce API calls.
3. **Optimistic Updates**: Prepared for mutations with cache rollbacks.
4. **Suspense & Streaming**: Dashboard sections wrapped in Suspense with loading skeletons.
5. **Batching**: Single summary API call per dashboard to minimize round trips.
6. **Middleware**: Server-side route protection and redirection.

## 📁 Folder Structure

```text
/app
  /login        - Login page
  /dashboard    - Shared layout & role-based pages
/components
  /ui           - Reusable shadcn-like components
  /dashboard    - Dashboard-specific blocks (KPICard, StatsRow, etc.)
  /layout       - Sidebar and Navbar
/hooks          - Custom React Query & utility hooks
/services       - API abstraction layer
/store          - Zustand auth store
/lib            - Global configs (Axios, QueryClient)
/types          - Shared TS interfaces
```
