import { sql } from './db.js';
import { createAuditLog } from './audit.js';
import { emitNotificationEvent } from './notifications-engine.js';
import { recordBookingEvent } from './timeline-engine.js';

/**
 * Retrieves platform trust & warranty policy settings
 */
export async function getTrustPolicy() {
  try {
    const rows = await sql`
      SELECT value FROM platform_settings WHERE key = 'trust_warranty_policy' LIMIT 1;
    `;
    if (rows.length > 0 && rows[0].value) {
      return typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
    }
  } catch (e) {
    console.warn('[Trust Policy Fetch Warning]:', e.message);
  }
  return {
    workmanship_warranty_days: 30,
    part_warranty_days: 180,
    claim_window_days: 30,
    no_show_window_hours: 24
  };
}

/**
 * Calculates server-side verified review rating & distribution for a professional
 */
export async function calculateProfessionalRating(professionalId) {
  if (!professionalId) return { averageRating: 5.0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

  const reviews = await sql`
    SELECT rating FROM reviews
    WHERE professional_id = ${professionalId} AND status = 'published';
  `;

  const totalReviews = reviews.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (totalReviews === 0) {
    return { averageRating: 5.0, totalReviews: 0, distribution };
  }

  let sum = 0;
  reviews.forEach(r => {
    const ratingVal = Math.min(5, Math.max(1, Number(r.rating) || 5));
    sum += ratingVal;
    distribution[ratingVal] = (distribution[ratingVal] || 0) + 1;
  });

  const averageRating = Math.round((sum / totalReviews) * 10) / 10;

  // Persist updated average rating to professional profile
  try {
    await sql`
      UPDATE profiles
      SET rating = ${averageRating},
          reviews_count = ${totalReviews},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${professionalId};
    `;
  } catch (e) {
    console.warn('[Rating Sync Warning]:', e.message);
  }

  return { averageRating, totalReviews, distribution };
}

/**
 * Evaluates validity of a service warranty record
 */
export function calculateWarrantyValidity(warranty) {
  if (!warranty || !warranty.end_date) {
    return { isValid: false, status: 'voided', daysRemaining: 0 };
  }

  if (warranty.status === 'claimed' || warranty.status === 'voided') {
    return { isValid: false, status: warranty.status, daysRemaining: 0 };
  }

  const now = new Date();
  const endDate = new Date(warranty.end_date);
  const diffMs = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  if (daysRemaining <= 0) {
    return { isValid: false, status: 'expired', daysRemaining: 0 };
  }

  return {
    isValid: true,
    status: 'active',
    daysRemaining
  };
}

/**
 * Creates 30-day workmanship warranty for a completed booking (Idempotent)
 */
export async function createServiceWarrantyForBooking({
  bookingId,
  actorId = 'system',
  warrantyDays = null,
  coverageDescription = null,
  exclusions = null
}) {
  const bRows = await sql`
    SELECT * FROM bookings WHERE id = ${bookingId} OR booking_ref = ${bookingId} LIMIT 1;
  `;
  if (bRows.length === 0) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  const booking = bRows[0];

  // Idempotency check: Return existing warranty if already created
  const existing = await sql`
    SELECT * FROM service_warranties WHERE booking_id = ${booking.id} LIMIT 1;
  `;
  if (existing.length > 0) {
    return { success: true, warranty: existing[0], created: false };
  }

  const policy = await getTrustPolicy();
  const days = Number(warrantyDays) || Number(policy.workmanship_warranty_days) || 30;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const warrantyId = 'war-' + booking.id;
  const coverage = coverageDescription || `HOMMIE ${days}-Day Workmanship Quality & Service Guarantee`;
  const excl = exclusions || 'Accidental damage, unauthorized third-party tampering, normal consumable wear';

  const rows = await sql`
    INSERT INTO service_warranties (
      id, booking_id, customer_id, professional_id, home_asset_id,
      warranty_type, start_date, end_date, coverage_description, exclusions, status
    ) VALUES (
      ${warrantyId}, ${booking.id}, ${booking.customer_id}, ${booking.worker_id || 'unassigned'}, ${booking.home_asset_id || null},
      'workmanship', ${startStr}, ${endStr}, ${coverage}, ${excl}, 'active'
    )
    ON CONFLICT (booking_id) DO UPDATE
    SET updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  await createAuditLog({
    actorId,
    actorName: 'System Warranty Engine',
    actorRole: 'system',
    action: 'warranty_created',
    targetId: warrantyId,
    details: { bookingId: booking.id, days, endStr }
  });

  await emitNotificationEvent({
    recipientId: booking.customer_id,
    type: 'WARRANTY_CREATED',
    title: 'Workmanship Warranty Active',
    message: `Your ${days}-day HOMMIE Workmanship Warranty for booking #${booking.booking_ref} is now active until ${endStr}.`,
    bookingId: booking.id,
    metadata: { warrantyId, endDate: endStr }
  });

  return { success: true, warranty: rows[0], created: true };
}

/**
 * Submits a verified customer review
 */
export async function submitReview({
  bookingId,
  customerUser,
  rating,
  comment,
  tags = []
}) {
  if (!customerUser || customerUser.role !== 'customer') {
    const err = new Error('Forbidden: Only customers can submit reviews');
    err.statusCode = 403;
    throw err;
  }

  const ratingNum = parseInt(rating, 10);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    const err = new Error('Rating must be an integer between 1 and 5');
    err.statusCode = 400;
    throw err;
  }

  const bRows = await sql`
    SELECT * FROM bookings WHERE id = ${bookingId} OR booking_ref = ${bookingId} LIMIT 1;
  `;
  if (bRows.length === 0) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  const booking = bRows[0];

  // Anti-manipulation 1: Must own booking
  if (booking.customer_id !== customerUser.id) {
    const err = new Error('Forbidden: You can only review your own bookings');
    err.statusCode = 403;
    throw err;
  }

  // Anti-manipulation 2: Booking must be completed
  if (booking.status !== 'completed') {
    const err = new Error('Cannot review an incomplete service. Service must be in completed status.');
    err.statusCode = 400;
    throw err;
  }

  // Anti-manipulation 3: Professional cannot review themselves
  if (booking.worker_id === customerUser.id) {
    const err = new Error('Self-reviews are strictly prohibited');
    err.statusCode = 400;
    throw err;
  }

  if (!booking.worker_id) {
    const err = new Error('Cannot review a booking without an assigned professional');
    err.statusCode = 400;
    throw err;
  }

  // Anti-manipulation 4: One review per booking (Idempotent / Duplicate prevention)
  const existing = await sql`
    SELECT * FROM reviews WHERE booking_id = ${booking.id} LIMIT 1;
  `;
  if (existing.length > 0) {
    const err = new Error('Duplicate review: You have already submitted a review for this booking');
    err.statusCode = 409;
    throw err;
  }

  const reviewId = 'rev-' + booking.id;
  const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

  const rows = await sql`
    INSERT INTO reviews (
      id, booking_id, customer_id, professional_id, rating, comment, tags, status
    ) VALUES (
      ${reviewId}, ${booking.id}, ${customerUser.id}, ${booking.worker_id},
      ${ratingNum}, ${comment || null}, ${tagsJson}::jsonb, 'published'
    )
    RETURNING *;
  `;

  // Server-side recalculation of professional rating & distribution
  const ratingSummary = await calculateProfessionalRating(booking.worker_id);

  await recordBookingEvent({
    bookingId: booking.id,
    actorId: customerUser.id,
    actorRole: 'customer',
    eventType: 'REVIEW_SUBMITTED',
    title: 'Customer Review Submitted',
    description: `Customer gave a ${ratingNum}-star rating: "${comment || 'Verified service review'}"`,
    metadata: { rating: ratingNum, reviewId }
  });

  await createAuditLog({
    actorId: customerUser.id,
    actorName: customerUser.full_name || customerUser.name || 'Customer',
    actorRole: 'customer',
    action: 'review_created',
    targetId: reviewId,
    details: { bookingId: booking.id, professionalId: booking.worker_id, rating: ratingNum }
  });

  await emitNotificationEvent({
    recipientId: booking.worker_id,
    type: 'REVIEW_PUBLISHED',
    title: 'New Customer Review',
    message: `A customer submitted a ${ratingNum}-star review for booking #${booking.booking_ref}.`,
    bookingId: booking.id,
    metadata: { rating: ratingNum, reviewId }
  });

  return {
    success: true,
    review: rows[0],
    ratingSummary
  };
}

/**
 * Admin review moderation
 */
export async function moderateReview({ reviewId, status, adminUser, reason = '' }) {
  if (!adminUser || adminUser.role !== 'admin') {
    const err = new Error('Forbidden: Admin access required');
    err.statusCode = 403;
    throw err;
  }

  const validStatuses = ['published', 'hidden', 'removed', 'flagged'];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const revRows = await sql`SELECT * FROM reviews WHERE id = ${reviewId} LIMIT 1;`;
  if (revRows.length === 0) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    throw err;
  }
  const review = revRows[0];

  const updatedRows = await sql`
    UPDATE reviews
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${reviewId}
    RETURNING *;
  `;

  // Recalculate pro rating with updated status
  const ratingSummary = await calculateProfessionalRating(review.professional_id);

  await createAuditLog({
    actorId: adminUser.id,
    actorName: adminUser.full_name || 'Admin',
    actorRole: 'admin',
    action: 'review_moderated',
    targetId: reviewId,
    details: { previousStatus: review.status, newStatus: status, reason }
  });

  return { success: true, review: updatedRows[0], ratingSummary };
}

/**
 * Uploads secure service evidence (before/after/meter/damage photos)
 */
export async function uploadServiceEvidence({
  bookingId,
  actorUser,
  evidenceType,
  fileName,
  mimeType = 'image/jpeg',
  fileSize = 0,
  dataContent,
  caption = '',
  homeAssetId = null
}) {
  const bRows = await sql`SELECT * FROM bookings WHERE id = ${bookingId} OR booking_ref = ${bookingId} LIMIT 1;`;
  if (bRows.length === 0) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  const booking = bRows[0];

  // RBAC: Worker must be assigned pro; Customer must own booking; Admin allowed
  if (actorUser.role === 'worker' && booking.worker_id !== actorUser.id) {
    const err = new Error('Forbidden: You are not the assigned professional for this booking');
    err.statusCode = 403;
    throw err;
  }
  if (actorUser.role === 'customer' && booking.customer_id !== actorUser.id) {
    const err = new Error('Forbidden: You do not own this booking');
    err.statusCode = 403;
    throw err;
  }

  const validTypes = ['before_photo', 'after_photo', 'damage_photo', 'installation_photo', 'meter_reading', 'part_photo', 'service_report', 'other'];
  if (!validTypes.includes(evidenceType)) {
    const err = new Error(`Invalid evidence type. Must be one of: ${validTypes.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const evidenceId = 'evi-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

  const rows = await sql`
    INSERT INTO service_evidence (
      id, booking_id, professional_id, customer_id, home_asset_id,
      evidence_type, file_name, mime_type, file_size, data_content, caption
    ) VALUES (
      ${evidenceId}, ${booking.id}, ${booking.worker_id}, ${booking.customer_id}, ${homeAssetId || booking.home_asset_id || null},
      ${evidenceType}, ${fileName}, ${mimeType}, ${Number(fileSize) || 0}, ${dataContent || null}, ${caption || null}
    )
    RETURNING id, booking_id, professional_id, customer_id, home_asset_id, evidence_type, file_name, mime_type, file_size, caption, created_at;
  `;

  // Record timeline event
  const typeLabel = evidenceType.replace(/_/g, ' ').toUpperCase();
  await recordBookingEvent({
    bookingId: booking.id,
    actorId: actorUser.id,
    actorRole: actorUser.role,
    eventType: 'SERVICE_EVIDENCE_UPLOADED',
    title: `Evidence Attached: ${typeLabel}`,
    description: caption || `Attached ${fileName} (${typeLabel}) to service record`,
    metadata: { evidenceId, evidenceType, fileName }
  });

  await createAuditLog({
    actorId: actorUser.id,
    actorName: actorUser.full_name || 'User',
    actorRole: actorUser.role,
    action: 'evidence_uploaded',
    targetId: evidenceId,
    details: { bookingId: booking.id, evidenceType, fileName }
  });

  return { success: true, evidence: rows[0] };
}

/**
 * Creates a warranty claim
 */
export async function createWarrantyClaim({
  warrantyId,
  bookingId,
  customerUser,
  issueDescription
}) {
  if (!customerUser || customerUser.role !== 'customer') {
    const err = new Error('Forbidden: Only customers can submit warranty claims');
    err.statusCode = 403;
    throw err;
  }

  const wRows = await sql`SELECT * FROM service_warranties WHERE id = ${warrantyId} OR booking_id = ${bookingId} LIMIT 1;`;
  if (wRows.length === 0) {
    const err = new Error('Warranty record not found');
    err.statusCode = 404;
    throw err;
  }
  const warranty = wRows[0];

  if (warranty.customer_id !== customerUser.id) {
    const err = new Error('Forbidden: You do not own this warranty');
    err.statusCode = 403;
    throw err;
  }

  const validity = calculateWarrantyValidity(warranty);
  if (!validity.isValid) {
    const err = new Error(`Warranty claim rejected: Warranty status is ${validity.status} and coverage has ended.`);
    err.statusCode = 409;
    throw err;
  }

  // Idempotency / Duplicate active claim prevention
  const activeClaims = await sql`
    SELECT * FROM warranty_claims
    WHERE warranty_id = ${warranty.id} AND status IN ('submitted', 'under_review', 'repair_scheduled', 'approved')
    LIMIT 1;
  `;
  if (activeClaims.length > 0) {
    const err = new Error('An active warranty claim is already in progress for this service');
    err.statusCode = 409;
    throw err;
  }

  const claimId = 'clm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

  const rows = await sql`
    INSERT INTO warranty_claims (
      id, warranty_id, booking_id, customer_id, professional_id, issue_description, status
    ) VALUES (
      ${claimId}, ${warranty.id}, ${warranty.booking_id}, ${warranty.customer_id}, ${warranty.professional_id},
      ${issueDescription}, 'submitted'
    )
    RETURNING *;
  `;

  await sql`
    UPDATE service_warranties
    SET status = 'claimed', updated_at = CURRENT_TIMESTAMP
    WHERE id = ${warranty.id};
  `;

  await createAuditLog({
    actorId: customerUser.id,
    actorName: customerUser.full_name || 'Customer',
    actorRole: 'customer',
    action: 'warranty_claim_created',
    targetId: claimId,
    details: { warrantyId: warranty.id, bookingId: warranty.booking_id, issueDescription }
  });

  await emitNotificationEvent({
    recipientId: warranty.customer_id,
    type: 'WARRANTY_CLAIM_SUBMITTED',
    title: 'Warranty Claim Submitted',
    message: `Your warranty claim for booking #${warranty.booking_id} has been submitted and is under review.`,
    bookingId: warranty.booking_id,
    metadata: { claimId, warrantyId: warranty.id }
  });

  if (warranty.professional_id && warranty.professional_id !== 'unassigned') {
    await emitNotificationEvent({
      recipientId: warranty.professional_id,
      type: 'WARRANTY_CLAIM_SUBMITTED',
      title: 'Warranty Claim Filed',
      message: `A customer submitted a warranty claim regarding your completed service #${warranty.booking_id}.`,
      bookingId: warranty.booking_id,
      metadata: { claimId, warrantyId: warranty.id }
    });
  }

  return { success: true, claim: rows[0] };
}

/**
 * Creates a formal dispute
 */
export async function createDispute({
  bookingId,
  customerUser,
  reason,
  description,
  priority = 'medium',
  claimId = null
}) {
  if (!customerUser || customerUser.role !== 'customer') {
    const err = new Error('Forbidden: Only customers can open disputes');
    err.statusCode = 403;
    throw err;
  }

  const validReasons = [
    'poor_workmanship', 'incomplete_service', 'wrong_part', 'damaged_property',
    'overcharging', 'service_not_completed', 'no_show', 'misleading_quote',
    'safety_issue', 'warranty_issue', 'other'
  ];
  if (!validReasons.includes(reason)) {
    const err = new Error(`Invalid dispute reason. Must be one of: ${validReasons.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const bRows = await sql`SELECT * FROM bookings WHERE id = ${bookingId} OR booking_ref = ${bookingId} LIMIT 1;`;
  if (bRows.length === 0) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  const booking = bRows[0];

  if (booking.customer_id !== customerUser.id) {
    const err = new Error('Forbidden: You do not own this booking');
    err.statusCode = 403;
    throw err;
  }

  // Dispute Window Enforcement
  const policy = await getTrustPolicy();
  const claimWindowDays = Number(policy.claim_window_days) || 30;
// const noShowWindowHours = Number(policy.no_show_window_hours) || 24;

  const now = new Date();
  const bookingCreatedDate = new Date(booking.created_at || booking.scheduled_date || Date.now());
  const diffDays = (now.getTime() - bookingCreatedDate.getTime()) / (1000 * 60 * 60 * 24);

  if (reason === 'no_show') {
// const diffHours = (now.getTime() - bookingCreatedDate.getTime()) / (1000 * 60 * 60);
    // Allow reporting no-show during scheduled window
  } else if (diffDays > claimWindowDays) {
    const err = new Error(`Dispute window expired: Claims must be submitted within ${claimWindowDays} days of service completion`);
    err.statusCode = 409;
    throw err;
  }

  // Idempotency: Check if active dispute already exists
  const existingDispute = await sql`
    SELECT * FROM disputes
    WHERE booking_id = ${booking.id} AND status IN ('opened', 'under_review', 'awaiting_customer', 'awaiting_professional', 'escalated')
    LIMIT 1;
  `;
  if (existingDispute.length > 0) {
    const err = new Error('An active dispute is already open for this booking');
    err.statusCode = 409;
    throw err;
  }

  const assignedWorker = booking.worker_id || 'unassigned';
  const disputePriority = (reason === 'damaged_property' || reason === 'safety_issue') ? 'high' : priority;
  const disputeId = 'dsp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

  const rows = await sql`
    INSERT INTO disputes (
      id, booking_id, customer_id, professional_id, claim_id, reason, description, status, priority
    ) VALUES (
      ${disputeId}, ${booking.id}, ${booking.customer_id}, ${assignedWorker},
      ${claimId || null}, ${reason}, ${description}, 'opened', ${disputePriority}
    )
    RETURNING *;
  `;

  await createAuditLog({
    actorId: customerUser.id,
    actorName: customerUser.full_name || 'Customer',
    actorRole: 'customer',
    action: 'dispute_created',
    targetId: disputeId,
    details: { bookingId: booking.id, professionalId: assignedWorker, reason, priority: disputePriority }
  });

  await emitNotificationEvent({
    recipientId: booking.customer_id,
    type: 'DISPUTE_OPENED',
    title: 'Dispute Case Opened',
    message: `Dispute #${disputeId} regarding booking #${booking.booking_ref} has been received. Our governance team is reviewing it.`,
    bookingId: booking.id,
    metadata: { disputeId, reason }
  });

  if (assignedWorker && assignedWorker !== 'unassigned') {
    await emitNotificationEvent({
      recipientId: assignedWorker,
      type: 'DISPUTE_RESPONSE_REQUIRED',
      title: 'Dispute Notice: Response Required',
      message: `A dispute has been raised for booking #${booking.booking_ref} (${reason.replace(/_/g, ' ')}). Please provide your statement and service evidence.`,
      bookingId: booking.id,
      metadata: { disputeId, reason }
    });
  }

  return { success: true, dispute: rows[0] };
}

/**
 * Submits response/evidence to an active dispute
 */
export async function respondToDispute({
  disputeId,
  responderUser,
  message,
  evidenceIds = []
}) {
  const dRows = await sql`SELECT * FROM disputes WHERE id = ${disputeId} LIMIT 1;`;
  if (dRows.length === 0) {
    const err = new Error('Dispute not found');
    err.statusCode = 404;
    throw err;
  }
  const dispute = dRows[0];

  // RBAC check
  if (responderUser.role === 'customer' && dispute.customer_id !== responderUser.id) {
    const err = new Error('Forbidden: You do not own this dispute');
    err.statusCode = 403;
    throw err;
  }
  if (responderUser.role === 'worker' && dispute.professional_id !== responderUser.id) {
    const err = new Error('Forbidden: You are not the assigned professional for this dispute');
    err.statusCode = 403;
    throw err;
  }

  const respId = 'dres-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const evidenceJson = JSON.stringify(Array.isArray(evidenceIds) ? evidenceIds : []);

  const respRows = await sql`
    INSERT INTO dispute_responses (
      id, dispute_id, responder_id, responder_role, message, evidence_ids
    ) VALUES (
      ${respId}, ${dispute.id}, ${responderUser.id}, ${responderUser.role}, ${message}, ${evidenceJson}::jsonb
    )
    RETURNING *;
  `;

  const nextStatus = dispute.status === 'opened' ? 'under_review' : dispute.status;
  await sql`
    UPDATE disputes
    SET status = ${nextStatus}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${dispute.id};
  `;

  await createAuditLog({
    actorId: responderUser.id,
    actorName: responderUser.full_name || responderUser.name || 'User',
    actorRole: responderUser.role,
    action: 'dispute_evidence_added',
    targetId: dispute.id,
    details: { responseId: respId, responderRole: responderUser.role, messageSnippet: message.substring(0, 100) }
  });

  return { success: true, response: respRows[0] };
}

/**
 * Admin resolves a dispute with authoritative decision
 */
export async function resolveDispute({
  disputeId,
  adminUser,
  resolutionType,
  resolutionNotes,
  refundAmount = null,
  payoutAdjustment = null
}) {
  if (!adminUser || adminUser.role !== 'admin') {
    const err = new Error('Forbidden: Admin access required');
    err.statusCode = 403;
    throw err;
  }

  const validResolutions = [
    'no_action', 'rework', 'warranty_repair', 'partial_refund',
    'full_refund', 'professional_payout_adjustment', 'customer_credit', 'cancelled'
  ];
  if (!validResolutions.includes(resolutionType)) {
    const err = new Error(`Invalid resolution type. Must be one of: ${validResolutions.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const dRows = await sql`SELECT * FROM disputes WHERE id = ${disputeId} LIMIT 1;`;
  if (dRows.length === 0) {
    const err = new Error('Dispute not found');
    err.statusCode = 404;
    throw err;
  }
  const dispute = dRows[0];

  // State Machine Validation: Prevent resolving already resolved/cancelled disputes
  if (['resolved', 'rejected', 'cancelled'].includes(dispute.status)) {
    const err = new Error(`Dispute is already in final state: ${dispute.status}`);
    err.statusCode = 409;
    throw err;
  }

  const bRows = await sql`SELECT * FROM bookings WHERE id = ${dispute.booking_id} LIMIT 1;`;
  const booking = bRows[0] || {};

  let refundResult = null;
  let payoutResult = null;

  // 1. Handle Refund Actions (Integrated with Phase 6 Refund Engine)
  if (resolutionType === 'full_refund' || resolutionType === 'partial_refund') {
    const pRows = await sql`SELECT * FROM payments WHERE booking_id = ${dispute.booking_id} AND status = 'captured' LIMIT 1;`;
    const payment = pRows[0];
    const totalPaid = payment ? Number(payment.amount) : Number(booking.service_price || 0);

    const calculatedRefundAmount = resolutionType === 'full_refund'
      ? totalPaid
      : (refundAmount !== null ? Number(refundAmount) : Math.round(totalPaid * 0.5 * 100) / 100);

    // Idempotent refund insert
    const existingRefund = await sql`SELECT * FROM refunds WHERE booking_id = ${dispute.booking_id} LIMIT 1;`;
    if (existingRefund.length === 0) {
      const refundId = 'rfnd-' + Date.now();
      const refRows = await sql`
        INSERT INTO refunds (
          id, booking_id, payment_id, customer_id, amount, reason,
          status, refund_policy_applied, processed_at
        ) VALUES (
          ${refundId}, ${dispute.booking_id}, ${payment ? payment.id : 'pay-dispute'},
          ${dispute.customer_id}, ${calculatedRefundAmount},
          ${'Dispute Resolution: ' + (resolutionNotes || resolutionType)},
          'processed', 'dispute_resolution', CURRENT_TIMESTAMP
        )
        RETURNING *;
      `;
      refundResult = refRows[0];

      // Update payment record
      if (payment) {
        await sql`
          UPDATE payments
          SET status = ${resolutionType === 'full_refund' ? 'refunded' : 'partially_refunded'},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payment.id};
        `;
      }

      // Professional earnings adjustment: reverse payout status
      if (dispute.professional_id && dispute.professional_id !== 'unassigned') {
        await sql`
          UPDATE professional_earnings
          SET payout_status = 'reversed',
              updated_at = CURRENT_TIMESTAMP
          WHERE booking_id = ${dispute.booking_id} AND professional_id = ${dispute.professional_id};
        `;
      }

      await createAuditLog({
        actorId: adminUser.id,
        actorName: adminUser.full_name || 'Admin',
        actorRole: 'admin',
        action: 'refund_authorized',
        targetId: refundId,
        details: { disputeId: dispute.id, amount: calculatedRefundAmount, resolutionType }
      });
    } else {
      refundResult = existingRefund[0];
    }
  }

  // 2. Handle Payout Adjustment Action
  if (resolutionType === 'professional_payout_adjustment' && payoutAdjustment !== null) {
    const adjAmount = Number(payoutAdjustment);
    const peRows = await sql`
      SELECT * FROM professional_earnings
      WHERE booking_id = ${dispute.booking_id} AND professional_id = ${dispute.professional_id}
      LIMIT 1;
    `;
    if (peRows.length > 0) {
      const pe = peRows[0];
      const originalNet = Number(pe.net_earnings);
      const newNet = Math.max(0, originalNet - adjAmount);

      await sql`
        UPDATE professional_earnings
        SET net_earnings = ${newNet},
            convenience_deductions = COALESCE(convenience_deductions, 0) + ${adjAmount},
            payout_status = ${newNet === 0 ? 'reversed' : pe.payout_status},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${pe.id};
      `;

      await createAuditLog({
        actorId: adminUser.id,
        actorName: adminUser.full_name || 'Admin',
        actorRole: 'admin',
        action: 'payout_adjusted',
        targetId: pe.id,
        details: { disputeId: dispute.id, originalPayout: originalNet, adjustment: adjAmount, finalPayout: newNet, reason: resolutionNotes }
      });

      payoutResult = { originalPayout: originalNet, adjustment: adjAmount, finalPayout: newNet };
    }
  }

  // 3. Update Dispute Record
  const newStatus = resolutionType === 'cancelled' ? 'cancelled' : (resolutionType === 'no_action' ? 'rejected' : 'resolved');
  const updatedDispute = await sql`
    UPDATE disputes
    SET status = ${newStatus},
        resolution_type = ${resolutionType},
        resolution_notes = ${resolutionNotes || 'Dispute resolved by platform administrator'},
        resolved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${dispute.id}
    RETURNING *;
  `;

  // 4. Update linked warranty claim if exists
  if (dispute.claim_id) {
    await sql`
      UPDATE warranty_claims
      SET status = ${newStatus === 'resolved' ? 'resolved' : 'rejected'},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${dispute.claim_id};
    `;
  }

  // 5. Timeline, Audit & Notifications
  await recordBookingEvent({
    bookingId: dispute.booking_id,
    actorId: adminUser.id,
    actorRole: 'admin',
    eventType: 'DISPUTE_RESOLVED',
    title: `Dispute Resolved: ${resolutionType.replace(/_/g, ' ').toUpperCase()}`,
    description: resolutionNotes || `Platform administrator resolved dispute with ${resolutionType}`,
    metadata: { disputeId: dispute.id, resolutionType, resolutionNotes }
  });

  await createAuditLog({
    actorId: adminUser.id,
    actorName: adminUser.full_name || 'Admin',
    actorRole: 'admin',
    action: 'dispute_resolved',
    targetId: dispute.id,
    details: { resolutionType, resolutionNotes, refundResult, payoutResult }
  });

  await emitNotificationEvent({
    recipientId: dispute.customer_id,
    type: 'DISPUTE_RESOLVED',
    title: 'Dispute Case Resolved',
    message: `Your dispute for booking #${booking.booking_ref || dispute.booking_id} was resolved (${resolutionType.replace(/_/g, ' ')}). Note: ${resolutionNotes}`,
    bookingId: dispute.booking_id,
    metadata: { disputeId: dispute.id, resolutionType }
  });

  if (dispute.professional_id && dispute.professional_id !== 'unassigned') {
    await emitNotificationEvent({
      recipientId: dispute.professional_id,
      type: 'DISPUTE_RESOLVED',
      title: 'Dispute Decision Rendered',
      message: `Dispute decision for booking #${booking.booking_ref || dispute.booking_id}: ${resolutionType.replace(/_/g, ' ')}.`,
      bookingId: dispute.booking_id,
      metadata: { disputeId: dispute.id, resolutionType }
    });
  }

  return {
    success: true,
    dispute: updatedDispute[0],
    refund: refundResult,
    payout: payoutResult
  };
}
