# Worker Application System & Admin Portal Setup

## Overview
This system provides a complete workflow for worker registration, application review, and admin approval through both mobile app and web portal interfaces.

## Features Implemented

### 1. Mobile App - Worker Signup
- ✅ **Enhanced Form**: Full name, username, email, phone, department, speciality
- ✅ **Photo Upload**: ID card verification with proper file handling
- ✅ **Database Integration**: Applications saved to `worker_applications` table
- ✅ **Status Management**: Applications start with 'pending' status requiring admin approval
- ✅ **Form Validation**: All required fields validated before submission
- ✅ **User Feedback**: Clear success messages explaining the approval process

### 2. Database Schema
- ✅ **worker_applications table**: Complete application data storage
- ✅ **profiles table**: Enhanced with approval workflow
- ✅ **admin_actions table**: Audit trail for all admin activities
- ✅ **Storage setup**: Proper file storage for ID card documents
- ✅ **RLS Policies**: Security policies for data access control
- ✅ **Helper Functions**: Stored procedures for approval/rejection workflow

### 3. Admin API & Components
- ✅ **Admin API**: Complete TypeScript API for web portal integration
- ✅ **React Components**: Ready-to-use admin interface components
- ✅ **Statistics Dashboard**: Application stats and metrics
- ✅ **Approval Workflow**: Approve/reject with notes and reasons
- ✅ **Document Viewing**: Secure ID card image viewing
- ✅ **Search & Filtering**: Advanced application search capabilities

## Setup Instructions

### Step 1: Database Setup
1. **Run the SQL setup file** in your Supabase SQL Editor:
   ```bash
   # Execute this file in Supabase Dashboard > SQL Editor
   WORKER_APPLICATIONS_SETUP.sql
   ```

2. **Verify tables created**:
   - `worker_applications` - Main application data
   - `admin_actions` - Admin activity log
   - Storage bucket `worker-documents` for ID cards

### Step 2: Mobile App Configuration
The mobile app is already configured with:
- Enhanced worker signup form
- Photo upload functionality
- Proper error handling
- Application status management

### Step 3: Web Admin Portal Setup

#### Option A: Integration with existing web app
1. **Copy admin API**:
   ```bash
   cp src/lib/adminAPI.ts your-web-app/lib/
   ```

2. **Copy React component**:
   ```bash
   cp src/components/WorkerApplicationsManager.tsx your-web-app/components/
   ```

3. **Install dependencies** in your web app:
   ```bash
   npm install @supabase/supabase-js
   ```

4. **Use the component**:
   ```tsx
   import WorkerApplicationsManager from './components/WorkerApplicationsManager';
   
   function AdminDashboard() {
     const adminUserId = "your-admin-user-id";
     return (
       <div>
         <h1>Admin Portal</h1>
         <WorkerApplicationsManager adminId={adminUserId} />
       </div>
     );
   }
   ```

#### Option B: Standalone Next.js Admin Portal
1. **Create new Next.js app**:
   ```bash
   npx create-next-app@latest worker-admin-portal
   cd worker-admin-portal
   npm install @supabase/supabase-js
   ```

2. **Add environment variables** (`.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Create admin pages**:
   ```tsx
   // pages/admin/workers.tsx
   import WorkerApplicationsManager from '../components/WorkerApplicationsManager';
   
   export default function WorkersPage() {
     return <WorkerApplicationsManager adminId="admin-user-id" />;
   }
   ```

### Step 4: Admin User Setup
1. **Create admin profile** in Supabase:
   ```sql
   -- Insert admin user into profiles table
   INSERT INTO profiles (id, email, role, full_name, approval_status)
   VALUES (
     'admin-user-uuid',
     'admin@yourcompany.com',
     'admin',
     'System Administrator',
     'approved'
   );
   ```

2. **Create corresponding auth user** or link existing admin user

## API Usage Examples

### Get Pending Applications
```typescript
import { getPendingWorkerApplications } from './lib/adminAPI';

const pendingApps = await getPendingWorkerApplications();
console.log(`${pendingApps.length} applications pending review`);
```

### Approve Application
```typescript
import { approveWorkerApplication } from './lib/adminAPI';

const success = await approveWorkerApplication(
  'application-id',
  'admin-user-id',
  'Approved - meets all requirements'
);
```

### Get Application Statistics
```typescript
import { getApplicationStats } from './lib/adminAPI';

const stats = await getApplicationStats();
// { total: 25, pending: 5, approved: 18, rejected: 2 }
```

## Worker Application Workflow

### 1. Worker Signs Up (Mobile App)
1. Worker fills complete form with personal and work details
2. Worker uploads ID card photo for verification
3. Application saved with 'pending' status
4. Worker receives confirmation message
5. Profile created but marked as not approved

### 2. Admin Reviews (Web Portal)
1. Admin sees application in pending list
2. Admin can view all details including ID card
3. Admin can add notes and approve/reject
4. Admin action is logged for audit trail

### 3. Application Approval
1. If approved:
   - Application status → 'approved'
   - Profile approval_status → 'approved'
   - Worker can now sign in to mobile app
   - Worker gets dashboard access

2. If rejected:
   - Application status → 'rejected'
   - Rejection reason saved
   - Worker notified (can implement email notification)

## Security Features
- ✅ **Row Level Security (RLS)**: Database access controlled by user roles
- ✅ **File Security**: ID card images stored securely with signed URLs
- ✅ **Admin-only Actions**: Only admin users can approve/reject applications
- ✅ **Audit Trail**: All admin actions logged with timestamps
- ✅ **Data Validation**: Form validation on both client and server side

## Testing the System

### Test Worker Signup
1. Open mobile app
2. Go to Worker auth screen
3. Switch to "Sign Up" mode
4. Fill all fields:
   - Full Name: John Smith
   - Username: johnsmith123
   - Email: john@example.com
   - Phone: +1234567890
   - Department: Road Maintenance
   - Speciality: Pothole Repair
   - Upload an ID card image
5. Submit application
6. Verify success message about admin review

### Test Admin Portal
1. Open web admin portal
2. Login as admin user
3. Check pending applications
4. View application details
5. Test approval/rejection workflow
6. Verify audit logs

## Database Queries for Monitoring

### Check Application Status
```sql
SELECT status, COUNT(*) 
FROM worker_applications 
GROUP BY status;
```

### Recent Applications
```sql
SELECT full_name, email, department, status, application_date
FROM worker_applications 
ORDER BY application_date DESC 
LIMIT 10;
```

### Admin Activity
```sql
SELECT action_type, COUNT(*), DATE(created_at)
FROM admin_actions 
GROUP BY action_type, DATE(created_at)
ORDER BY DATE(created_at) DESC;
```

## File Structure

```
src/
├── app/(auth)/worker.tsx           # Enhanced worker signup
├── lib/
│   ├── adminAPI.ts                 # Admin API functions
│   └── supabase.ts                 # Supabase client
├── components/
│   └── WorkerApplicationsManager.tsx # React admin component
└── WORKER_APPLICATIONS_SETUP.sql   # Database setup
```

## Next Steps

1. **Email Notifications**: Add email alerts for application status changes
2. **Bulk Actions**: Admin ability to approve/reject multiple applications
3. **Advanced Filtering**: More filter options (date range, department, etc.)
4. **Export Functionality**: Export application data to CSV/Excel
5. **Mobile Admin**: Mobile admin app for on-the-go management
6. **Analytics Dashboard**: Detailed statistics and reporting

## Troubleshooting

### Common Issues

1. **Photo Upload Fails**:
   - Check storage bucket permissions
   - Verify file size limits
   - Ensure proper MIME type handling

2. **Applications Not Saving**:
   - Check database permissions
   - Verify required fields validation
   - Check error logs in browser/app

3. **Admin Portal Not Loading**:
   - Verify admin user permissions
   - Check API endpoint configuration
   - Ensure admin role in profiles table

4. **Worker Can't Sign In After Approval**:
   - Check profile approval_status
   - Verify auth user exists
   - Check RLS policies

### Support
For additional support:
1. Check Supabase dashboard logs
2. Use browser developer tools for web portal issues
3. Check mobile app console for client-side errors
4. Verify database schema matches setup file