// Admin API functions for web portal
// These functions can be used in a React web admin dashboard

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for admin operations
// Note: In production, use service role key for admin operations
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for worker applications
export interface WorkerApplication {
  id: string;
  full_name: string;
  email: string;
  username: string;
  phone: string;
  department: string;
  speciality: string;
  id_card_url: string;
  id_card_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  application_date: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  admin_notes?: string;
  auth_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_id: string;
  details: any;
  created_at: string;
}

// Admin API Functions

/**
 * Get all pending worker applications
 */
export async function getPendingWorkerApplications(): Promise<WorkerApplication[]> {
  const { data, error } = await supabase
    .from('worker_applications')
    .select('*')
    .eq('status', 'pending')
    .order('application_date', { ascending: false });

  if (error) {
    console.error('Error fetching pending applications:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get all worker applications with pagination
 */
export async function getAllWorkerApplications(
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<{ applications: WorkerApplication[]; total: number }> {
  let query = supabase
    .from('worker_applications')
    .select('*', { count: 'exact' })
    .order('application_date', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }

  return {
    applications: data || [],
    total: count || 0
  };
}

/**
 * Get worker application by ID
 */
export async function getWorkerApplicationById(id: string): Promise<WorkerApplication | null> {
  const { data, error } = await supabase
    .from('worker_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching application:', error);
    throw error;
  }

  return data;
}

/**
 * Approve a worker application
 */
export async function approveWorkerApplication(
  applicationId: string,
  adminId: string,
  adminNotes?: string
): Promise<boolean> {
  try {
    // Use the stored function for approval
    const { data, error } = await supabase.rpc('approve_worker_application', {
      application_id: applicationId,
      admin_user_id: adminId
    });

    if (error) {
      console.error('Error approving application:', error);
      throw error;
    }

    // Optionally add admin notes
    if (adminNotes) {
      await supabase
        .from('worker_applications')
        .update({ admin_notes: adminNotes })
        .eq('id', applicationId);
    }

    return true;
  } catch (error) {
    console.error('Error in approval process:', error);
    return false;
  }
}

/**
 * Reject a worker application
 */
export async function rejectWorkerApplication(
  applicationId: string,
  adminId: string,
  reason: string,
  adminNotes?: string
): Promise<boolean> {
  try {
    // Use the stored function for rejection
    const { data, error } = await supabase.rpc('reject_worker_application', {
      application_id: applicationId,
      admin_user_id: adminId,
      reason: reason
    });

    if (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }

    // Optionally add admin notes
    if (adminNotes) {
      await supabase
        .from('worker_applications')
        .update({ admin_notes: adminNotes })
        .eq('id', applicationId);
    }

    return true;
  } catch (error) {
    console.error('Error in rejection process:', error);
    return false;
  }
}

/**
 * Update application status to under review
 */
export async function markApplicationUnderReview(
  applicationId: string,
  adminId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('worker_applications')
      .update({
        status: 'under_review',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId
      })
      .eq('id', applicationId);

    if (error) {
      console.error('Error updating application status:', error);
      throw error;
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: 'mark_under_review',
        target_id: applicationId,
        details: { status: 'under_review' }
      });

    return true;
  } catch (error) {
    console.error('Error marking application under review:', error);
    return false;
  }
}

/**
 * Get application statistics
 */
export async function getApplicationStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  under_review: number;
}> {
  const { data, error } = await supabase
    .from('worker_applications')
    .select('status');

  if (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }

  const stats = {
    total: data.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    under_review: 0
  };

  data.forEach(app => {
    switch (app.status) {
      case 'pending':
        stats.pending++;
        break;
      case 'approved':
        stats.approved++;
        break;
      case 'rejected':
        stats.rejected++;
        break;
      case 'under_review':
        stats.under_review++;
        break;
    }
  });

  return stats;
}

/**
 * Get admin actions log
 */
export async function getAdminActions(
  page: number = 1,
  limit: number = 50
): Promise<{ actions: AdminAction[]; total: number }> {
  const { data, error, count } = await supabase
    .from('admin_actions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error('Error fetching admin actions:', error);
    throw error;
  }

  return {
    actions: data || [],
    total: count || 0
  };
}

/**
 * Get signed URL for ID card image
 */
export async function getIdCardImageUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('worker-documents')
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }

  return data.signedUrl;
}

/**
 * Search worker applications
 */
export async function searchWorkerApplications(
  searchTerm: string,
  filters?: {
    status?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<WorkerApplication[]> {
  let query = supabase
    .from('worker_applications')
    .select('*')
    .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
    .order('application_date', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.department) {
    query = query.eq('department', filters.department);
  }

  if (filters?.startDate) {
    query = query.gte('application_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('application_date', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error searching applications:', error);
    throw error;
  }

  return data || [];
}

// Helper function to format application data for export
export function formatApplicationForExport(application: WorkerApplication) {
  return {
    'Application ID': application.id,
    'Full Name': application.full_name,
    'Email': application.email,
    'Username': application.username,
    'Phone': application.phone,
    'Department': application.department,
    'Speciality': application.speciality,
    'Status': application.status,
    'Application Date': new Date(application.application_date).toLocaleDateString(),
    'Reviewed Date': application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : 'Not reviewed',
    'Rejection Reason': application.rejection_reason || 'N/A',
    'Admin Notes': application.admin_notes || 'N/A'
  };
}

export default {
  getPendingWorkerApplications,
  getAllWorkerApplications,
  getWorkerApplicationById,
  approveWorkerApplication,
  rejectWorkerApplication,
  markApplicationUnderReview,
  getApplicationStats,
  getAdminActions,
  getIdCardImageUrl,
  searchWorkerApplications,
  formatApplicationForExport
};