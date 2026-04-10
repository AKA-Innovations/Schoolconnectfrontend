# Class Management Module - Documentation

## Overview

The Class Management Module provides a complete solution for managing classes, sections, and teacher assignments in your school ERP. It includes multiple pages and components designed to handle different aspects of class administration.

## Module Structure

```
Class Management
├── Backend APIs (services/class.service.ts)
├── Custom Hooks (hooks/useClasses.ts)
├── Components (components/admin/class/)
│   ├── ClassSummaryDashboard.tsx
│   ├── ClassesOverview.tsx
│   ├── ClassDetails.tsx
│   ├── ClassTeacherMapping.tsx
│   ├── ClassSectionExplorer.tsx
│   └── EditClassForm.tsx
└── Routes (app/dashboard/admin/class/)
    ├── page.tsx (Overview)
    ├── dashboard/page.tsx (Main Dashboard)
    ├── new/page.tsx (Create New Class)
    ├── [id]/page.tsx (Class Details)
    ├── [id]/edit/page.tsx (Edit Class)
    ├── teachers/page.tsx (Teacher Mapping)
    └── explorer/page.tsx (Class & Section Explorer)
```

## API Endpoints

### Classes

- **GET** `/school/classes` - List all classes
  - Query params: `page`, `limit`, `className`
  - Returns paginated list of classes with sections

- **GET** `/school/class/{classDtlsId}` - Get single class details
  - Returns full class info + sections + class teacher

- **PUT** `/school/class/{classDtlsId}` - Update class
  - Body: `{ className?, strength?, description? }`

- **DELETE** `/school/class/{classDtlsId}` - Delete class
  - Permanent deletion

- **POST** `/school/class` - Create new class
  - Body: `{ className, strength?, description? }`

### Sections

- **GET** `/school/classes/{className}/sections` - List sections for a class
  - Returns array of sections with teacher assignments

### Class Teachers

- **GET** `/school/class-teachers` - List all class teacher mappings
  - Query params: `page`, `limit`, `className`, `teacherName`
  - Returns paginated list of teacher assignments

## Features

### 1. Class Management Dashboard
**Route:** `/dashboard/admin/class/dashboard`

A comprehensive overview page featuring:
- Summary statistics (total classes, sections, teachers)
- Quick access cards to all features
- Quick action buttons for common tasks
- Basic information about classes and sections

### 2. Classes Overview
**Route:** `/dashboard/admin/class`

Main list view with:
- All classes in a table format
- Search by class name
- View, edit, and delete actions
- Class teacher information
- Section count per class
- Pagination support
- Direct links to class details

### 3. Create New Class
**Route:** `/dashboard/admin/class/new`

Form to create a new class with:
- Class name (required)
- Total strength (students)
- Description/notes
- Form validation
- Success redirect to class details

### 4. Class Details
**Route:** `/dashboard/admin/class/{id}`

Detailed view showing:
- Class information cards (name, strength, section count)
- Assigned class teacher details
- List of all sections in a table
- Section details (strength, teacher assignment)
- Edit and delete buttons
- Delete confirmation dialog

### 5. Edit Class
**Route:** `/dashboard/admin/class/{id}/edit`

Form to update class information:
- Class name
- Total strength
- Description
- Edit validation
- Back navigation on cancel

### 6. Class Teacher Mapping
**Route:** `/dashboard/admin/class/teachers`

Teacher assignment overview with:
- Table of all class-section-teacher mappings
- Search by class name or teacher name
- Teacher contact information (email, phone)
- Assignment status badges
- Pagination support

### 7. Class & Section Explorer
**Route:** `/dashboard/admin/class/explorer`

Master-detail layout with:
- Left sidebar: List of all classes
- Main panel: Sections for selected class
- Section cards with detailed information
- Auto-selects first class on load
- Real-time updates on class selection

## Custom Hooks

### useClasses(params?)
```typescript
const { data, isLoading, isFetching, refetch } = useClasses({ 
  page: 1, 
  limit: 10, 
  className: 'searchTerm' 
});
```
Returns paginated list of classes with pagination info.

### useClass(classDtlsId)
```typescript
const { data, isLoading } = useClass(1);
```
Returns single class details including sections and teacher.

### useSectionsByClassName(className)
```typescript
const { data: sections } = useSectionsByClassName('10A');
```
Returns array of sections for a specific class.

### useClassTeachers(params?)
```typescript
const { data, isLoading } = useClassTeachers({ 
  className: 'search',
  teacherName: 'search',
  page: 1 
});
```
Returns paginated list of class-teacher mappings.

### useClassSummary()
```typescript
const { data } = useClassSummary();
```
Returns summary statistics (totalClasses, totalSections, totalClassTeachersAssigned).

### useUpdateClass(classDtlsId)
```typescript
const mutation = useUpdateClass(1);
mutation.mutate({ className: 'new', strength: 50 });
```
Updates a class and invalidates cache.

### useDeleteClass()
```typescript
const mutation = useDeleteClass();
mutation.mutate(classDtlsId);
```
Deletes a class and invalidates cache.

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `next/navigation` - Client-side routing
- Custom UI components from `/components/ui`
- `lucide-react` - Icons

## Usage Examples

### Basic Class Listing
```typescript
import { useClasses } from '@/hooks/useClasses';

function ClassList() {
  const { data, isLoading } = useClasses({ page: 1, limit: 10 });
  
  return (
    <div>
      {data?.items.map(cls => (
        <div key={cls.id}>{cls.className}</div>
      ))}
    </div>
  );
}
```

### Create New Class
```typescript
const response = await api.post('/school/class', {
  className: '10A',
  strength: 45,
  description: 'Science stream'
});
```

### Update Class
```typescript
const mutation = useUpdateClass(classId);
mutation.mutate({
  className: '10A',
  strength: 50,
  description: 'Updated'
});
```

### Delete Class
```typescript
const mutation = useDeleteClass();
mutation.mutate(classId);
```

## Styling & Design

- **Color Scheme**: Blue, Purple, Emerald, Orange
- **Border Radius**: 2rem (rounded-2xl) for main components
- **Spacing**: Consistent 6px-8px padding/gaps
- **Typography**: Bold headers with uppercase tracking-widest labels
- **Icons**: lucide-react icons with consistent sizing (h-4 w-4)

## Error Handling

All mutations include error handling:
- Form validation on create/update
- Confirmation dialogs for destructive actions
- Error messages displayed to users
- Try-catch blocks for API failures

## Performance Optimization

- Pagination for large lists
- Query caching via react-query
- Placeholder data for better UX
- Dynamic imports where applicable
- Debounced search inputs

## Future Enhancements

- [ ] Batch import classes from CSV
- [ ] Class analytics and statistics
- [ ] Section creation/management UI
- [ ] Advanced filter options
- [ ] Bulk actions (delete, assign teachers)
- [ ] Export to PDF/Excel

## Testing

Test the module with these scenarios:
1. Create a new class
2. View class details with sections
3. Edit class information
4. Delete a class (with confirmation)
5. Search by class name or teacher
6. Navigate between different views
7. Verify pagination works
8. Check responsive design on mobile

## Support

For issues or questions:
- Check the API endpoints in the backend
- Verify school ID is correctly passed
- Check browser console for errors
- Review network tab for API responses
