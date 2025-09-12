// Example React component for Web Admin Portal
// This can be used in a Next.js or React web application

import React, { useState, useEffect } from 'react';
import {
  getPendingWorkerApplications,
  getAllWorkerApplications,
  approveWorkerApplication,
  rejectWorkerApplication,
  getApplicationStats,
  getIdCardImageUrl,
  WorkerApplication
} from '../lib/adminAPI';

interface WorkerApplicationsManagerProps {
  adminId: string; // The admin user's ID
}

const WorkerApplicationsManager: React.FC<WorkerApplicationsManagerProps> = ({ adminId }) => {
  const [applications, setApplications] = useState<WorkerApplication[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, under_review: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApplication, setSelectedApplication] = useState<WorkerApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadApplications();
    loadStats();
  }, [filter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      if (filter === 'pending') {
        const data = await getPendingWorkerApplications();
        setApplications(data);
      } else {
        const result = await getAllWorkerApplications(1, 50, filter === 'all' ? undefined : filter);
        setApplications(result.applications);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const statsData = await getApplicationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      const success = await approveWorkerApplication(applicationId, adminId, adminNotes);
      if (success) {
        alert('Worker application approved successfully!');
        loadApplications();
        loadStats();
        setShowModal(false);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error approving application. Please try again.');
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      const success = await rejectWorkerApplication(applicationId, adminId, rejectionReason, adminNotes);
      if (success) {
        alert('Worker application rejected.');
        loadApplications();
        loadStats();
        setShowModal(false);
        setRejectionReason('');
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application. Please try again.');
    }
  };

  const openApplicationDetails = (application: WorkerApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
    setRejectionReason('');
    setAdminNotes('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'approved': return '#28A745';
      case 'rejected': return '#DC3545';
      case 'under_review': return '#007BFF';
      default: return '#6C757D';
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading applications...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Worker Applications Management</h1>
      
      {/* Statistics Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', minWidth: '150px' }}>
          <h3>Total</h3>
          <p style={{ fontSize: '24px', margin: '0', color: '#333' }}>{stats.total}</p>
        </div>
        <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', minWidth: '150px' }}>
          <h3>Pending</h3>
          <p style={{ fontSize: '24px', margin: '0', color: '#856404' }}>{stats.pending}</p>
        </div>
        <div style={{ background: '#d4edda', padding: '20px', borderRadius: '8px', minWidth: '150px' }}>
          <h3>Approved</h3>
          <p style={{ fontSize: '24px', margin: '0', color: '#155724' }}>{stats.approved}</p>
        </div>
        <div style={{ background: '#f8d7da', padding: '20px', borderRadius: '8px', minWidth: '150px' }}>
          <h3>Rejected</h3>
          <p style={{ fontSize: '24px', margin: '0', color: '#721c24' }}>{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px' }}>
        {['all', 'pending', 'approved', 'rejected'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              border: '1px solid #ddd',
              background: filter === filterType ? '#007BFF' : 'white',
              color: filter === filterType ? 'white' : 'black',
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {filterType}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Department</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Speciality</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Applied</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{app.full_name}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{app.email}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{app.phone}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{app.department}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{app.speciality}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    background: getStatusColor(app.status),
                    fontSize: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {app.status}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {formatDate(app.application_date)}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => openApplicationDetails(app)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #007BFF',
                      background: '#007BFF',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {applications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No {filter === 'all' ? '' : filter} applications found.
        </div>
      )}

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto'
          }}>
            <h2>Worker Application Details</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>Personal Information</h3>
              <p><strong>Name:</strong> {selectedApplication.full_name}</p>
              <p><strong>Email:</strong> {selectedApplication.email}</p>
              <p><strong>Username:</strong> {selectedApplication.username}</p>
              <p><strong>Phone:</strong> {selectedApplication.phone}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Work Information</h3>
              <p><strong>Department:</strong> {selectedApplication.department}</p>
              <p><strong>Speciality:</strong> {selectedApplication.speciality}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Application Status</h3>
              <p><strong>Status:</strong> {selectedApplication.status}</p>
              <p><strong>Applied:</strong> {formatDate(selectedApplication.application_date)}</p>
              {selectedApplication.reviewed_at && (
                <p><strong>Reviewed:</strong> {formatDate(selectedApplication.reviewed_at)}</p>
              )}
            </div>

            {selectedApplication.id_card_url && (
              <div style={{ marginBottom: '20px' }}>
                <h3>ID Card</h3>
                <p><strong>Document Type:</strong> {selectedApplication.id_card_type}</p>
                <button
                  onClick={async () => {
                    try {
                      const url = await getIdCardImageUrl(selectedApplication.id_card_url);
                      window.open(url, '_blank');
                    } catch (error) {
                      alert('Error loading ID card image');
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #28A745',
                    background: '#28A745',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  View ID Card
                </button>
              </div>
            )}

            {selectedApplication.status === 'pending' && (
              <div style={{ marginBottom: '20px' }}>
                <h3>Admin Actions</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <label>Admin Notes (Optional):</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      minHeight: '60px',
                      marginTop: '5px'
                    }}
                    placeholder="Add any notes about this application..."
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label>Rejection Reason (if rejecting):</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      minHeight: '60px',
                      marginTop: '5px'
                    }}
                    placeholder="Reason for rejection (required if rejecting)..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleApprove(selectedApplication.id)}
                    style={{
                      padding: '10px 20px',
                      border: '1px solid #28A745',
                      background: '#28A745',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => handleReject(selectedApplication.id)}
                    style={{
                      padding: '10px 20px',
                      border: '1px solid #DC3545',
                      background: '#DC3545',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #6C757D',
                  background: '#6C757D',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerApplicationsManager;