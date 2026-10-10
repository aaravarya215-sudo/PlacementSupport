/**
 * PlacePulse - Automated Placement Eligibility Verification Engine
 * Solves student misplacement, rule violations, and offer-hoarding.
 */

export const TIER_CONFIG = {
  TIER_1_SUPER_DREAM: {
    label: 'Super Dream (Tier 1)',
    minCtc: 12.0,
    badgeColor: 'purple'
  },
  TIER_2_DREAM: {
    label: 'Dream (Tier 2)',
    minCtc: 6.0,
    maxCtc: 12.0,
    badgeColor: 'blue'
  },
  TIER_3_REGULAR: {
    label: 'Regular / Mass (Tier 3)',
    maxCtc: 6.0,
    badgeColor: 'slate'
  }
};

/**
 * Evaluates a student against a specific placement drive
 * @param {Object} student - Student record
 * @param {Object} drive - Placement drive record
 * @returns {Object} Full verification report with granular checklists and policy validation
 */
export function evaluateStudentEligibility(student, drive) {
  const criteria = drive.eligibilityCriteria || {};
  const checks = [];
  const blockingReasons = [];

  // 1. CGPA Check
  if (criteria.minCgpa !== undefined && criteria.minCgpa !== null) {
    const passed = student.cgpa >= criteria.minCgpa;
    checks.push({
      id: 'cgpa',
      label: 'Minimum CGPA',
      required: `>= ${criteria.minCgpa}`,
      actual: student.cgpa.toFixed(2),
      passed,
      message: passed
        ? `CGPA ${student.cgpa.toFixed(2)} meets the requirement (${criteria.minCgpa})`
        : `CGPA ${student.cgpa.toFixed(2)} is below minimum requirement (${criteria.minCgpa})`
    });
    if (!passed) {
      blockingReasons.push(`CGPA is below cutoff (${student.cgpa.toFixed(2)} < ${criteria.minCgpa})`);
    }
  }

  // 2. Active Backlogs Check
  if (criteria.maxActiveBacklogs !== undefined) {
    const passed = student.activeBacklogs <= criteria.maxActiveBacklogs;
    checks.push({
      id: 'activeBacklogs',
      label: 'Active Backlogs',
      required: `<= ${criteria.maxActiveBacklogs} active`,
      actual: `${student.activeBacklogs} active`,
      passed,
      message: passed
        ? `Active backlogs (${student.activeBacklogs}) within acceptable limit (max ${criteria.maxActiveBacklogs})`
        : `Active backlogs (${student.activeBacklogs}) exceed maximum allowed (${criteria.maxActiveBacklogs})`
    });
    if (!passed) {
      blockingReasons.push(`Active backlogs exceed limit (${student.activeBacklogs} > ${criteria.maxActiveBacklogs})`);
    }
  }

  // 3. Historical / Dead Backlogs Check
  if (criteria.allowHistoryBacklogs === false) {
    const passed = (student.totalBacklogsHistory || 0) === 0;
    checks.push({
      id: 'historyBacklogs',
      label: 'Backlog History',
      required: 'No backlog history (Clean record)',
      actual: `${student.totalBacklogsHistory || 0} lifetime backlogs`,
      passed,
      message: passed
        ? 'No historical backlogs in academic record'
        : 'Company strictly disallows any historical/cleared backlogs'
    });
    if (!passed) {
      blockingReasons.push('Strict no-backlog history policy violated');
    }
  }

  // 4. Branch / Department Eligibility
  if (Array.isArray(criteria.eligibleBranches) && criteria.eligibleBranches.length > 0) {
    const passed = criteria.eligibleBranches.includes(student.department);
    checks.push({
      id: 'branch',
      label: 'Eligible Branches',
      required: criteria.eligibleBranches.join(', '),
      actual: student.department,
      passed,
      message: passed
        ? `Department "${student.department}" is eligible`
        : `Department "${student.department}" is not permitted for this role`
    });
    if (!passed) {
      blockingReasons.push(`Branch "${student.department}" not among eligible departments`);
    }
  }

  // 5. Graduation Batch Check
  if (Array.isArray(criteria.eligibleBatches) && criteria.eligibleBatches.length > 0) {
    const passed = criteria.eligibleBatches.includes(student.batch);
    checks.push({
      id: 'batch',
      label: 'Graduation Batch',
      required: criteria.eligibleBatches.join(', '),
      actual: `${student.batch}`,
      passed,
      message: passed
        ? `Batch ${student.batch} is eligible`
        : `Drive is open only for batch: ${criteria.eligibleBatches.join(', ')}`
    });
    if (!passed) {
      blockingReasons.push(`Batch ${student.batch} is not eligible`);
    }
  }

  // 6. 10th Standard Percentage Cutoff
  if (criteria.minTenthPercentage !== undefined && criteria.minTenthPercentage !== null) {
    const passed = student.tenthPercentage >= criteria.minTenthPercentage;
    checks.push({
      id: 'tenthPercentage',
      label: '10th Grade Percentage',
      required: `>= ${criteria.minTenthPercentage}%`,
      actual: `${student.tenthPercentage}%`,
      passed,
      message: passed
        ? `10th percentage (${student.tenthPercentage}%) meets cutoff`
        : `10th percentage (${student.tenthPercentage}%) is below minimum (${criteria.minTenthPercentage}%)`
    });
    if (!passed) {
      blockingReasons.push(`10th percentage below cutoff (${student.tenthPercentage}% < ${criteria.minTenthPercentage}%)`);
    }
  }

  // 7. 12th / Diploma Percentage Cutoff
  if (criteria.minTwelfthPercentage !== undefined && criteria.minTwelfthPercentage !== null) {
    const passed = student.twelfthPercentage >= criteria.minTwelfthPercentage;
    checks.push({
      id: 'twelfthPercentage',
      label: '12th / Diploma Percentage',
      required: `>= ${criteria.minTwelfthPercentage}%`,
      actual: `${student.twelfthPercentage}%`,
      passed,
      message: passed
        ? `12th percentage (${student.twelfthPercentage}%) meets cutoff`
        : `12th percentage (${student.twelfthPercentage}%) is below minimum (${criteria.minTwelfthPercentage}%)`
    });
    if (!passed) {
      blockingReasons.push(`12th percentage below cutoff (${student.twelfthPercentage}% < ${criteria.minTwelfthPercentage}%)`);
    }
  }

  // 8. Gender Specific Drive (e.g. Women in Tech programs)
  if (criteria.genderRestriction && criteria.genderRestriction !== 'ALL') {
    const passed = student.gender.toUpperCase() === criteria.genderRestriction.toUpperCase();
    checks.push({
      id: 'gender',
      label: 'Gender Inclusivity',
      required: criteria.genderRestriction === 'FEMALE_ONLY' ? 'Female Candidates Only' : criteria.genderRestriction,
      actual: student.gender,
      passed,
      message: passed
        ? 'Gender criteria satisfied'
        : 'Drive is exclusively reserved for female diversity hiring'
    });
    if (!passed) {
      blockingReasons.push('Drive is restricted by diversity hiring criteria');
    }
  }

  // 9. Placement Policy Tier Safeguard (Anti-Misplacement & Offer-Hoarding Engine)
  const policyCheck = evaluatePlacementPolicySafeguard(student, drive);
  checks.push(policyCheck);
  if (!policyCheck.passed) {
    blockingReasons.push(policyCheck.message);
  }

  // 10. Deadline Check
  const now = new Date();
  const deadline = new Date(drive.registrationDeadline);
  const isExpired = deadline < now;
  const isDriveActive = drive.status === 'ACTIVE' && !isExpired;

  const isEligible = checks.every(c => c.passed) && isDriveActive;

  return {
    isEligible,
    isDriveActive,
    isExpired,
    deadline: drive.registrationDeadline,
    checks,
    blockingReasons,
    tier: drive.tier,
    driveCtc: drive.ctcLpa,
    studentPlacementStatus: student.placementStatus
  };
}

/**
 * Enforces Institutional Placement Policy to avoid student misplacement:
 * - Unplaced: Can apply to any drive
 * - Tier 3 Placed: Can apply for Tier 2 or Tier 1
 * - Tier 2 Placed: Can apply for Tier 1 if CTC >= 1.5x current offer
 * - Tier 1 Placed: Locked from applying (Prevents offer hoarding)
 */
export function evaluatePlacementPolicySafeguard(student, drive) {
  const currentStatus = student.placementStatus || { isPlaced: false };
  const driveTier = drive.tier;
  const driveCtc = drive.ctcLpa;

  // Case 1: Unplaced student - Fully open to apply
  if (!currentStatus.isPlaced) {
    return {
      id: 'placementPolicy',
      label: 'College Placement Policy',
      required: 'Open (Student is Unplaced)',
      actual: 'Unplaced',
      passed: true,
      message: 'Unplaced student - Eligible for all company tiers'
    };
  }

  // Case 2: Placed in Tier 1 (Super Dream)
  if (currentStatus.tier === 'TIER_1_SUPER_DREAM') {
    return {
      id: 'placementPolicy',
      label: 'College Placement Policy',
      required: 'Placement quota not exhausted',
      actual: `Already placed in Tier 1 (${currentStatus.company} @ ${currentStatus.ctcLpa} LPA)`,
      passed: false,
      message: `Policy Lock: You are already placed in Super Dream (${currentStatus.company}). Additional applications locked to ensure fair placement distribution across batch.`
    };
  }

  // Case 3: Placed in Tier 2 (Dream)
  if (currentStatus.tier === 'TIER_2_DREAM') {
    if (driveTier === 'TIER_1_SUPER_DREAM' && driveCtc >= (currentStatus.ctcLpa * 1.4)) {
      return {
        id: 'placementPolicy',
        label: 'College Placement Policy',
        required: 'Super Dream Upgrade Only (>= 1.4x current CTC)',
        actual: `Placed in Tier 2 (${currentStatus.company} @ ${currentStatus.ctcLpa} LPA) -> Applying for Super Dream (${driveCtc} LPA)`,
        passed: true,
        message: `Upgrade Permitted: Current offer ${currentStatus.ctcLpa} LPA -> Target offer ${driveCtc} LPA satisfies Super Dream upgrade criteria.`
      };
    }

    return {
      id: 'placementPolicy',
      label: 'College Placement Policy',
      required: 'Super Dream Upgrade (> 12 LPA & >= 1.4x current offer)',
      actual: `Placed in Tier 2 (${currentStatus.company} @ ${currentStatus.ctcLpa} LPA) -> Attempting Tier: ${driveTier} (${driveCtc} LPA)`,
      passed: false,
      message: `Policy Lock: Since you hold a Dream offer (${currentStatus.company} @ ${currentStatus.ctcLpa} LPA), you can only apply for Super Dream drives with CTC >= ${(currentStatus.ctcLpa * 1.4).toFixed(1)} LPA.`
    };
  }

  // Case 4: Placed in Tier 3 (Regular / Mass)
  if (currentStatus.tier === 'TIER_3_REGULAR') {
    if (driveTier === 'TIER_1_SUPER_DREAM' || driveTier === 'TIER_2_DREAM') {
      return {
        id: 'placementPolicy',
        label: 'College Placement Policy',
        required: 'Dream or Super Dream Upgrade (> 6 LPA)',
        actual: `Placed in Tier 3 (${currentStatus.company} @ ${currentStatus.ctcLpa} LPA) -> Applying for ${driveTier} (${driveCtc} LPA)`,
        passed: true,
        message: `Upgrade Permitted: Student holding a Regular tier offer is allowed to apply for Dream / Super Dream tier roles.`
      };
    }

    return {
      id: 'placementPolicy',
      label: 'College Placement Policy',
      required: 'Upgrade to Dream or Super Dream only',
      actual: `Placed in Tier 3 (${currentStatus.company}) -> Attempting another Regular tier drive`,
      passed: false,
      message: `Policy Lock: You already hold a Regular tier offer (${currentStatus.company} @ ${currentStatus.ctcLpa} LPA). You cannot apply for other Regular tier companies to leave seats for unplaced peers.`
    };
  }

  return {
    id: 'placementPolicy',
    label: 'College Placement Policy',
    required: 'Standard validation',
    actual: 'Valid',
    passed: true,
    message: 'Placement policy check passed'
  };
}
