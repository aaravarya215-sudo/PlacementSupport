const BASE_URL = '/api';

export const api = {
  // Students
  getStudents: async () => {
    const res = await fetch(`${BASE_URL}/students`);
    return res.json();
  },
  getStudentById: async (id) => {
    const res = await fetch(`${BASE_URL}/students/${id}`);
    return res.json();
  },
  getStudentEligibleDrives: async (studentId) => {
    const res = await fetch(`${BASE_URL}/students/${studentId}/eligible-drives`);
    return res.json();
  },
  getStudentApplications: async (studentId) => {
    const res = await fetch(`${BASE_URL}/students/${studentId}/applications`);
    return res.json();
  },
  updateStudent: async (id, data) => {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Drives
  getDrives: async () => {
    const res = await fetch(`${BASE_URL}/drives`);
    return res.json();
  },
  getDriveById: async (id) => {
    const res = await fetch(`${BASE_URL}/drives/${id}`);
    return res.json();
  },
  createDrive: async (driveData) => {
    const res = await fetch(`${BASE_URL}/drives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driveData)
    });
    return res.json();
  },
  updateDrive: async (id, driveData) => {
    const res = await fetch(`${BASE_URL}/drives/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driveData)
    });
    return res.json();
  },
  deleteDrive: async (id) => {
    const res = await fetch(`${BASE_URL}/drives/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  getDriveBatchAudit: async (driveId) => {
    const res = await fetch(`${BASE_URL}/drives/${driveId}/eligibility-audit`);
    return res.json();
  },

  // Applications
  getApplications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/applications?${query}`);
    return res.json();
  },
  applyForDrive: async (applicationData) => {
    const res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    });
    return res.json();
  },
  updateApplicationStatus: async (id, statusData) => {
    const res = await fetch(`${BASE_URL}/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });
    return res.json();
  },

  // Announcements
  getAnnouncements: async () => {
    const res = await fetch(`${BASE_URL}/announcements`);
    return res.json();
  },
  createAnnouncement: async (data) => {
    const res = await fetch(`${BASE_URL}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteAnnouncement: async (id) => {
    const res = await fetch(`${BASE_URL}/announcements/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Analytics & Audit
  getAnalytics: async () => {
    const res = await fetch(`${BASE_URL}/analytics`);
    return res.json();
  },
  getAuditLogs: async () => {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    return res.json();
  }
};
