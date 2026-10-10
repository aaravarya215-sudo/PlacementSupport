import express from 'express';
import { StudentDB, DriveDB, ApplicationDB } from '../db/db.js';
import { evaluateStudentEligibility } from '../services/eligibilityEngine.js';

const router = express.Router();

// GET all students
router.get('/', (req, res) => {
  try {
    const students = StudentDB.getAll();
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single student
router.get('/:id', (req, res) => {
  try {
    const student = StudentDB.getById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE student profile
router.put('/:id', (req, res) => {
  try {
    const updated = StudentDB.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, data: updated, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all drives evaluated for a student with granular eligibility report
router.get('/:id/eligible-drives', (req, res) => {
  try {
    const student = StudentDB.getById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const drives = DriveDB.getAll();
    const existingApplications = ApplicationDB.getByStudentId(student.id);
    const appliedDriveIds = new Set(existingApplications.map(a => a.driveId));

    const evaluatedDrives = drives.map(drive => {
      const evaluation = evaluateStudentEligibility(student, drive);
      const application = existingApplications.find(a => a.driveId === drive.id) || null;

      return {
        ...drive,
        hasApplied: appliedDriveIds.has(drive.id),
        application,
        eligibility: evaluation
      };
    });

    const eligibleCount = evaluatedDrives.filter(d => d.eligibility.isEligible).length;
    const appliedCount = appliedDriveIds.size;

    res.json({
      success: true,
      data: evaluatedDrives,
      summary: {
        totalDrives: drives.length,
        eligibleDrives: eligibleCount,
        appliedDrives: appliedCount,
        placementStatus: student.placementStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET student applications
router.get('/:id/applications', (req, res) => {
  try {
    const apps = ApplicationDB.getByStudentId(req.params.id);
    const drives = DriveDB.getAll();

    const populated = apps.map(app => {
      const drive = drives.find(d => d.id === app.driveId);
      return {
        ...app,
        drive: drive || { companyName: 'Unknown', role: 'N/A' }
      };
    });

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
