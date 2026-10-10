import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import studentRoutes from './routes/students.js';
import driveRoutes from './routes/drives.js';
import applicationRoutes from './routes/applications.js';
import announcementRoutes from './routes/announcements.js';
import analyticsRoutes from './routes/analytics.js';
import auditRoutes from './routes/audit.js';
import { loadDatabase } from './db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize / load database
loadDatabase();

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PlacePulse Campus Placement Platform',
    version: '1.0.0'
  });
});

// Serve frontend build if present
const publicDir = path.resolve(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PlacePulse Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints ready at http://localhost:${PORT}/api/`);
});
