import express from 'express';
import { ApplicationDB, StudentDB, DriveDB, AuditLogDB } from '../db/db.js';
import { evaluateStudentEligibility } from '../services/eligibilityEngine.js';

const router = express.Router();

// GET all applications
router.get('/', (req, res) => {
  try {
    const { driveId, studentId, status } = req.query;
    let apps = ApplicationDB.getAll();

    if (driveId) apps = apps.filter(a => a.driveId === driveId);
    if (studentId) apps = apps.filter(a => a.studentId === studentId);
    if (status) apps = apps.filter(a => a.status === status);

    const students = StudentDB.getAll();
    const drives = DriveDB.getAll();

    const populated = apps.map(app => ({
      ...app,
      student: students.find(s => s.id === app.studentId) || null,
      drive: drives.find(d => d.id === app.driveId) || null
    }));

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Submit new application with strict eligibility check
router.post('/', (req, res) => {
  try {
    const { studentId, driveId, customResumeUrl, notes } = req.body;

    if (!studentId || !driveId) {
      return res.status(400).json({ success: false, error: 'Student ID and Drive ID are required' });
    }

    const student = StudentDB.getById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student record not found' });
    }

    const drive = DriveDB.getById(driveId);
    if (!drive) {
      return res.status(404).json({ success: false, error: 'Placement drive not found' });
    }

    // Check if already applied
    const existing = ApplicationDB.getExisting(studentId, driveId);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted an application for this drive',
        existingApplication: existing
      });
    }

    // RUN THE AUTOMATED ELIGIBILITY VERIFICATION ENGINE
    const evaluation = evaluateStudentEligibility(student, drive);

    if (!evaluation.isEligible) {
      // Record blocked attempt in Audit Log
      AuditLogDB.log('APPLICATION_BLOCKED_POLICY', {
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        driveId: drive.id,
        companyName: drive.companyName,
        reason: evaluation.blockingReasons.join('; ')
      });

      return res.status(403).json({
        success: false,
        error: 'Application Rejected: Ineligible based on institutional placement criteria',
        evaluation,
        blockingReasons: evaluation.blockingReasons
      });
    }

    // If eligible, create application
    const application = ApplicationDB.create({
      driveId,
      studentId,
      resumeUrl: customResumeUrl || student.resumeUrl,
      notes: notes || 'Applied via PlacePulse Portal with verified credentials',
      eligibilitySnapshot: {
        cgpa: student.cgpa,
        activeBacklogs: student.activeBacklogs,
        department: student.department,
        tenthPercentage: student.tenthPercentage,
        twelfthPercentage: student.twelfthPercentage,
        appliedAt: new Date().toISOString(),
        verified: true
      }
    });

    // Record verified application in Audit Log
    AuditLogDB.log('ELIGIBILITY_PASSED_APPLICATION', {
      applicationId: application.id,
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      driveId: drive.id,
      companyName: drive.companyName,
      reason: `Automated eligibility engine verified: All criteria passed for ${drive.companyName}`
    });

    res.status(201).json({
      success: true,
      data: application,
      message: `Application to ${drive.companyName} submitted successfully!`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH: Update applicant stage / status (TPO Admin)
router.patch('/:id/status', (req, res) => {
  try {
    const { status, notes, interviewSchedule, offerDetails } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const application = ApplicationDB.updateStatus(id, status, notes, interviewSchedule);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const student = StudentDB.getById(application.studentId);
    const drive = DriveDB.getById(application.driveId);

    // If candidate status is updated to OFFERED, update student's placement status and enforce tier locking!
    if (status === 'OFFERED' && student && drive) {
      const updatedPlacementStatus = {
        isPlaced: true,
        company: drive.companyName,
        role: drive.role,
        ctcLpa: (offerDetails && offerDetails.ctcLpa) || drive.ctcLpa,
        tier: drive.tier,
        offerLetterDate: new Date().toISOString().split('T')[0]
      };

      StudentDB.update(student.id, {
        placementStatus: updatedPlacementStatus
      });

      AuditLogDB.log('CANDIDATE_OFFERED', {
        applicationId: application.id,
        studentId: student.id,
        studentName: student.name,
        driveId: drive.id,
        companyName: drive.companyName,
        tier: drive.tier,
        ctcLpa: updatedPlacementStatus.ctcLpa,
        reason: `Student ${student.name} marked as Placed! Placement policy locking tier applied.`
      });
    }

    res.json({
      success: true,
      data: application,
      message: `Applicant stage updated to "${status}" successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Export candidates as CSV formatted for company submission
router.get('/export/csv/:driveId', (req, res) => {
  try {
    const { driveId } = req.params;
    const drive = DriveDB.getById(driveId);
    if (!drive) {
      return res.status(404).json({ success: false, error: 'Drive not found' });
    }

    const applications = ApplicationDB.getByDriveId(driveId);
    const students = StudentDB.getAll();

    const headers = [
      'Roll Number',
      'Full Name',
      'Email',
      'Phone',
      'Department',
      'Batch',
      'CGPA',
      'Active Backlogs',
      '10th %',
      '12th %',
      'Current Application Status',
      'Application Date',
      'Resume URL'
    ];

    const rows = applications.map(app => {
      const student = students.find(s => s.id === app.studentId);
      if (!student) return null;

      return [
        `"${student.rollNo}"`,
        `"${student.name}"`,
        `"${student.email}"`,
        `"${student.phone || 'N/A'}"`,
        `"${student.department}"`,
        student.batch,
        student.cgpa,
        student.activeBacklogs,
        student.tenthPercentage,
        student.twelfthPercentage,
        `"${app.status}"`,
        `"${new Date(app.appliedAt).toLocaleDateString()}"`,
        `"${app.resumeUrl || student.resumeUrl || ''}"`
      ].join(',');
    }).filter(Boolean);

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${drive.companyName.replace(/\s+/g, '_')}_Candidates.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
