import express from 'express';
import { DriveDB, StudentDB, ApplicationDB, AuditLogDB } from '../db/db.js';
import { evaluateStudentEligibility } from '../services/eligibilityEngine.js';

const router = express.Router();

// GET all drives
router.get('/', (req, res) => {
  try {
    const drives = DriveDB.getAll();
    res.json({ success: true, data: drives });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single drive by id
router.get('/:id', (req, res) => {
  try {
    const drive = DriveDB.getById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, error: 'Drive not found' });
    }

    // Attach current application count
    const applications = ApplicationDB.getByDriveId(req.params.id);
    res.json({
      success: true,
      data: {
        ...drive,
        totalApplicants: applications.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE new drive (TPO Admin)
router.post('/', (req, res) => {
  try {
    const {
      companyName,
      role,
      industry,
      jobLocation,
      employmentType,
      ctcLpa,
      stipendPerMonth,
      tier,
      description,
      registrationDeadline,
      driveDate,
      eligibilityCriteria,
      rounds
    } = req.body;

    if (!companyName || !role || !ctcLpa || !registrationDeadline) {
      return res.status(400).json({
        success: false,
        error: 'Missing required drive fields: companyName, role, ctcLpa, registrationDeadline'
      });
    }

    // Derive tier if not provided
    let derivedTier = tier;
    if (!derivedTier) {
      if (ctcLpa >= 12.0) derivedTier = 'TIER_1_SUPER_DREAM';
      else if (ctcLpa >= 6.0) derivedTier = 'TIER_2_DREAM';
      else derivedTier = 'TIER_3_REGULAR';
    }

    const drive = DriveDB.create({
      companyName,
      companyLogo: req.body.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0284c7&color=fff`,
      companyWebsite: req.body.companyWebsite || '',
      industry: industry || 'Information Technology',
      role,
      jobLocation: jobLocation || 'Pan India',
      employmentType: employmentType || 'Full-Time',
      ctcLpa: parseFloat(ctcLpa),
      stipendPerMonth: stipendPerMonth ? parseInt(stipendPerMonth) : 0,
      ctcBreakdown: req.body.ctcBreakdown || { base: parseFloat(ctcLpa) * 0.8, variable: parseFloat(ctcLpa) * 0.2, stocks: 0 },
      tier: derivedTier,
      description: description || 'Exciting career opportunity through campus placement.',
      registrationDeadline,
      driveDate: driveDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      rounds: rounds || [
        { id: 1, name: 'Online Assessment', date: driveDate || 'TBD', mode: 'Online', description: 'Technical & Aptitude test' }
      ],
      eligibilityCriteria: eligibilityCriteria || {
        minCgpa: 6.5,
        maxActiveBacklogs: 0,
        allowHistoryBacklogs: true,
        minTenthPercentage: 60.0,
        minTwelfthPercentage: 60.0,
        eligibleBranches: ['Computer Science & Engineering', 'Information Technology'],
        eligibleBatches: [2026],
        genderRestriction: 'ALL',
        tierEligibilityRequired: 'ALLOW_UPGRADE'
      },
      attachments: req.body.attachments || []
    });

    AuditLogDB.log('DRIVE_PUBLISHED', {
      driveId: drive.id,
      companyName: drive.companyName,
      role: drive.role,
      ctcLpa: drive.ctcLpa,
      reason: `New drive published by TPO with tier: ${drive.tier}`
    });

    res.status(201).json({ success: true, data: drive, message: 'Placement drive published successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE drive
router.put('/:id', (req, res) => {
  try {
    const updated = DriveDB.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Drive not found' });
    }
    res.json({ success: true, data: updated, message: 'Drive updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE drive
router.delete('/:id', (req, res) => {
  try {
    const success = DriveDB.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Drive not found' });
    }
    res.json({ success: true, message: 'Drive archived/removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// TPO BATCH AUDIT: Audit whole student body against this drive
router.get('/:id/eligibility-audit', (req, res) => {
  try {
    const drive = DriveDB.getById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, error: 'Drive not found' });
    }

    const students = StudentDB.getAll();
    const applications = ApplicationDB.getByDriveId(req.params.id);
    const appliedStudentIds = new Set(applications.map(a => a.studentId));

    const auditResults = students.map(student => {
      const evaluation = evaluateStudentEligibility(student, drive);
      const hasApplied = appliedStudentIds.has(student.id);

      return {
        student: {
          id: student.id,
          rollNo: student.rollNo,
          name: student.name,
          department: student.department,
          cgpa: student.cgpa,
          activeBacklogs: student.activeBacklogs,
          placementStatus: student.placementStatus
        },
        hasApplied,
        isEligible: evaluation.isEligible,
        blockingReasons: evaluation.blockingReasons,
        checks: evaluation.checks
      };
    });

    const eligibleStudents = auditResults.filter(r => r.isEligible);
    const ineligibleStudents = auditResults.filter(r => !r.isEligible);
    const appliedStudents = auditResults.filter(r => r.hasApplied);
    const eligibleNotApplied = auditResults.filter(r => r.isEligible && !r.hasApplied);

    res.json({
      success: true,
      data: {
        drive,
        stats: {
          totalStudents: students.length,
          totalEligible: eligibleStudents.length,
          totalIneligible: ineligibleStudents.length,
          totalApplied: appliedStudents.length,
          eligibleNotAppliedCount: eligibleNotApplied.length,
          turnoutRate: eligibleStudents.length > 0
            ? Math.round((appliedStudents.length / eligibleStudents.length) * 100)
            : 0
        },
        eligibleNotApplied: eligibleNotApplied.map(r => r.student),
        allEvaluations: auditResults
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
