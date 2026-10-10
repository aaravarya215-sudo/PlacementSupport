import express from 'express';
import { AuditLogDB } from '../db/db.js';

const router = express.Router();

// GET all audit logs
router.get('/', (req, res) => {
  try {
    const logs = AuditLogDB.getAll();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
