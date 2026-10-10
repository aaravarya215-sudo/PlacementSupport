import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'placepulse.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbCache = null;

export function loadDatabase() {
  if (dbCache) return dbCache;

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(raw);
      return dbCache;
    } catch (err) {
      console.error('Error loading database file, initializing empty:', err);
    }
  }

  // Fallback initial schema
  dbCache = {
    students: [],
    drives: [],
    applications: [],
    announcements: [],
    auditLogs: [],
    settings: {
      institutionName: 'Apex Institute of Technology & Management',
      currentAcademicYear: '2025-2026',
      activeBatch: 2026,
      tpoAdminName: 'Dr. Rajesh Sharma',
      tpoEmail: 'tpo@apex.edu.in'
    }
  };
  saveDatabase();
  return dbCache;
}

export function saveDatabase() {
  if (!dbCache) return;
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(dbCache, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Student Operations
export const StudentDB = {
  getAll: () => loadDatabase().students,
  getById: (id) => loadDatabase().students.find(s => s.id === id || s.rollNo === id),
  update: (id, updates) => {
    const db = loadDatabase();
    const index = db.students.findIndex(s => s.id === id || s.rollNo === id);
    if (index === -1) return null;
    db.students[index] = { ...db.students[index], ...updates };
    saveDatabase();
    return db.students[index];
  }
};

// Drive Operations
export const DriveDB = {
  getAll: () => loadDatabase().drives,
  getById: (id) => loadDatabase().drives.find(d => d.id === id),
  create: (driveData) => {
    const db = loadDatabase();
    const id = `drv_${Date.now()}`;
    const newDrive = {
      id,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      ...driveData
    };
    db.drives.unshift(newDrive);
    saveDatabase();
    return newDrive;
  },
  update: (id, updates) => {
    const db = loadDatabase();
    const index = db.drives.findIndex(d => d.id === id);
    if (index === -1) return null;
    db.drives[index] = { ...db.drives[index], ...updates };
    saveDatabase();
    return db.drives[index];
  },
  delete: (id) => {
    const db = loadDatabase();
    const initialLen = db.drives.length;
    db.drives = db.drives.filter(d => d.id !== id);
    saveDatabase();
    return db.drives.length < initialLen;
  }
};

// Application Operations
export const ApplicationDB = {
  getAll: () => loadDatabase().applications,
  getByStudentId: (studentId) => loadDatabase().applications.filter(a => a.studentId === studentId),
  getByDriveId: (driveId) => loadDatabase().applications.filter(a => a.driveId === driveId),
  getExisting: (studentId, driveId) => loadDatabase().applications.find(a => a.studentId === studentId && a.driveId === driveId),
  create: (appData) => {
    const db = loadDatabase();
    const id = `app_${Date.now()}`;
    const newApp = {
      id,
      appliedAt: new Date().toISOString(),
      status: 'APPLIED',
      ...appData
    };
    db.applications.unshift(newApp);
    saveDatabase();
    return newApp;
  },
  updateStatus: (id, status, notes = '', interviewSchedule = null) => {
    const db = loadDatabase();
    const app = db.applications.find(a => a.id === id);
    if (!app) return null;
    app.status = status;
    if (notes) app.notes = notes;
    if (interviewSchedule) app.interviewSchedule = interviewSchedule;
    app.updatedAt = new Date().toISOString();
    saveDatabase();
    return app;
  }
};

// Announcement Operations
export const AnnouncementDB = {
  getAll: () => loadDatabase().announcements,
  create: (data) => {
    const db = loadDatabase();
    const id = `ann_${Date.now()}`;
    const announcement = {
      id,
      createdAt: new Date().toISOString(),
      ...data
    };
    db.announcements.unshift(announcement);
    saveDatabase();
    return announcement;
  },
  delete: (id) => {
    const db = loadDatabase();
    db.announcements = db.announcements.filter(a => a.id !== id);
    saveDatabase();
    return true;
  }
};

// Audit Log Operations
export const AuditLogDB = {
  getAll: () => loadDatabase().auditLogs,
  log: (action, details) => {
    const db = loadDatabase();
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      timestamp: new Date().toISOString(),
      ...details
    };
    db.auditLogs.unshift(entry);
    saveDatabase();
    return entry;
  }
};

// Institutional Settings
export const SettingsDB = {
  get: () => loadDatabase().settings,
  update: (updates) => {
    const db = loadDatabase();
    db.settings = { ...db.settings, ...updates };
    saveDatabase();
    return db.settings;
  }
};
