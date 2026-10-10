import express from 'express';
import { StudentDB, DriveDB, ApplicationDB, AuditLogDB } from '../db/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const students = StudentDB.getAll();
    const drives = DriveDB.getAll();
    const applications = ApplicationDB.getAll();
    const auditLogs = AuditLogDB.getAll();

    const totalStudents = students.length;
    const placedStudents = students.filter(s => s.placementStatus && s.placementStatus.isPlaced);
    const placementRate = totalStudents > 0 ? Math.round((placedStudents.length / totalStudents) * 100) : 0;

    // CTC stats
    const placedCtcs = placedStudents.map(s => s.placementStatus.ctcLpa).filter(Boolean);
    const highestCtc = placedCtcs.length > 0 ? Math.max(...placedCtcs) : 0;
    const averageCtc = placedCtcs.length > 0
      ? (placedCtcs.reduce((acc, c) => acc + c, 0) / placedCtcs.length).toFixed(2)
      : 0;

    // Department-wise breakdown
    const deptStats = {};
    students.forEach(s => {
      const dept = s.department;
      if (!deptStats[dept]) {
        deptStats[dept] = { total: 0, placed: 0 };
      }
      deptStats[dept].total += 1;
      if (s.placementStatus && s.placementStatus.isPlaced) {
        deptStats[dept].placed += 1;
      }
    });

    const departmentBreakdown = Object.keys(deptStats).map(dept => ({
      department: dept,
      total: deptStats[dept].total,
      placed: deptStats[dept].placed,
      rate: deptStats[dept].total > 0
        ? Math.round((deptStats[dept].placed / deptStats[dept].total) * 100)
        : 0
    }));

    // Tier distribution
    const tierCounts = {
      TIER_1_SUPER_DREAM: placedStudents.filter(s => s.placementStatus.tier === 'TIER_1_SUPER_DREAM').length,
      TIER_2_DREAM: placedStudents.filter(s => s.placementStatus.tier === 'TIER_2_DREAM').length,
      TIER_3_REGULAR: placedStudents.filter(s => s.placementStatus.tier === 'TIER_3_REGULAR').length
    };

    // Audit / Safeguard Stats
    const blockedPolicyAttempts = auditLogs.filter(l => l.action === 'APPLICATION_BLOCKED_POLICY').length;
    const blockedCriteriaAttempts = auditLogs.filter(l => l.action === 'APPLICATION_BLOCKED_CRITERIA').length;
    const totalSafeguardsEnforced = blockedPolicyAttempts + blockedCriteriaAttempts;

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          placedStudents: placedStudents.length,
          unplacedStudents: totalStudents - placedStudents.length,
          placementRate,
          highestCtc,
          averageCtc,
          totalDrives: drives.length,
          activeDrives: drives.filter(d => d.status === 'ACTIVE').length,
          totalApplications: applications.length,
          totalSafeguardsEnforced,
          blockedPolicyAttempts
        },
        departmentBreakdown,
        tierDistribution: [
          { name: 'Super Dream (>12 LPA)', count: tierCounts.TIER_1_SUPER_DREAM, color: '#9333ea' },
          { name: 'Dream (6-12 LPA)', count: tierCounts.TIER_2_DREAM, color: '#2563eb' },
          { name: 'Regular / Mass (<6 LPA)', count: tierCounts.TIER_3_REGULAR, color: '#64748b' }
        ],
        recentPlaced: placedStudents.map(s => ({
          studentName: s.name,
          rollNo: s.rollNo,
          department: s.department,
          company: s.placementStatus.company,
          ctcLpa: s.placementStatus.ctcLpa,
          tier: s.placementStatus.tier
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
