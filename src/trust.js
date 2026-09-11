import { sql } from './db.js';
import { authenticateToken } from './auth-middleware.js';
import {
  getTrustPolicy,
  calculateProfessionalRating,
  calculateWarrantyValidity,
  // createServiceWarrantyForBooking,
  submitReview,
  moderateReview,
  uploadServiceEvidence,
  createWarrantyClaim,
  createDispute,
  respondToDispute,
  resolveDispute
} from './trust-engine.js';
import { createAuditLog } from './audit.js';

export default async function handler(req, res) {
  const { method, query = {}, body = {} } = req;

  // ---------------------------------------------------------------------------
  // 1. GET REQUESTS
  // ---------------------------------------------------------------------------
  if (method === 'GET') {
    const action = query.action || 'reviews';

    // A. PUBLIC / AUTHENTICATED: Get Reviews
    if (action === 'reviews' || action === 'list_reviews') {
      const professionalId = query.professionalId || query.workerId;
      // const customerId = query.customerId;
      const bookingId = query.bookingId;
      const page = Math.max(1, parseInt(query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
      const offset = (page - 1) * limit;

      let reviewsRows;
      let countRows;

      if (professionalId) {
        reviewsRows = await sql`
          SELECT r.*, c.full_name as customer_name, c.avatar_url as customer_avatar
          FROM reviews r
          LEFT JOIN profiles c ON r.customer_id = c.id
          WHERE r.professional_id = ${professionalId} AND r.status = 'published'
          ORDER BY r.created_at DESC
          LIMIT ${limit} OFFSET ${offset};
        `;
        countRows = await sql`
          SELECT count(*) as count FROM reviews
          WHERE professional_id = ${professionalId} AND status = 'published';
        `;
        const ratingSummary = await calculateProfessionalRating(professionalId);
        return res.status(200).json({
          success: true,
          reviews: reviewsRows,
          data: reviewsRows,
          summary: ratingSummary,
          pagination: { page, limit, total: Number(countRows[0]?.count || 0) }
        });
      } else if (bookingId) {
        reviewsRows = await sql`
          SELECT r.*, c.full_name as customer_name
          FROM reviews r
          LEFT JOIN profiles c ON r.customer_id = c.id
          WHERE r.booking_id = ${bookingId}
          LIMIT 1;
        `;
        return res.status(200).json({
          success: true,
          review: reviewsRows[0] || null,
          data: reviewsRows[0] || null
        });
      } else {
        // Admin / All reviews (or Customer own reviews if logged in)
        const user = await authenticateToken(req, res, true);
        if (user && user.role === 'customer') {
          reviewsRows = await sql`
            SELECT r.*, w.full_name as professional_name
            FROM reviews r
            LEFT JOIN profiles w ON r.professional_id = w.id
            WHERE r.customer_id = ${user.id}
            ORDER BY r.created_at DESC
            LIMIT ${limit} OFFSET ${offset};
          `;
          return res.status(200).json({ success: true, reviews: reviewsRows, data: reviewsRows });
        } else if (user && user.role === 'admin') {
          reviewsRows = await sql`
            SELECT r.*, c.full_name as customer_name, w.full_name as professional_name
            FROM reviews r
            LEFT JOIN profiles c ON r.customer_id = c.id
            LEFT JOIN profiles w ON r.professional_id = w.id
            ORDER BY r.created_at DESC
            LIMIT ${limit} OFFSET ${offset};
          `;
          return res.status(200).json({ success: true, reviews: reviewsRows, data: reviewsRows });
        }
        return res.status(200).json({ success: true, reviews: [], data: [] });
      }
    }

    // B. AUTHENTICATED: Get Warranties
    if (action === 'warranties' || action === 'list_warranties') {
      const user = await authenticateToken(req, res);
      if (!user) return;

      const page = Math.max(1, parseInt(query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
      const offset = (page - 1) * limit;

      let rows;
      if (user.role === 'customer') {
        rows = await sql`
          SELECT sw.*, b.booking_ref, b.service_title, w.full_name as professional_name
          FROM service_warranties sw
          JOIN bookings b ON sw.booking_id = b.id
          LEFT JOIN profiles w ON sw.professional_id = w.id
          WHERE sw.customer_id = ${user.id}
          ORDER BY sw.created_at DESC
          LIMIT ${limit} OFFSET ${offset};
        `;
      } else if (user.role === 'worker') {
        rows = await sql`
          SELECT sw.*, b.booking_ref, b.service_title, c.full_name as customer_name
          FROM service_warranties sw
          JOIN bookings b ON sw.booking_id = b.id
          LEFT JOIN profiles c ON sw.customer_id = c.id
          WHERE sw.professional_id = ${user.id}
          ORDER BY sw.created_at DESC
          LIMIT ${limit} OFFSET ${offset};
        `;
      } else {
        // Admin
        rows = await sql`
          SELECT sw.*, b.booking_ref, b.service_title, c.full_name as customer_name, w.full_name as professional_name
          FROM service_warranties sw
          JOIN bookings b ON sw.booking_id = b.id
          LEFT JOIN profiles c ON sw.customer_id = c.id
          LEFT JOIN profiles w ON sw.professional_id = w.id
          ORDER BY sw.created_at DESC
          LIMIT ${limit} OFFSET ${offset};
        `;
      }

      // Add calculated validity to each warranty
      const enhanced = rows.map(w => {
        const validity = calculateWarrantyValidity(w);
        return {
          ...w,
          isValid: validity.isValid,
          daysRemaining: validity.daysRemaining,
          calculated_status: validity.status
        };
      });

      return res.status(200).json({ success: true, warranties: enhanced, data: enhanced });
    }

    // C. AUTHENTICATED: Get Service Evidence for a Booking
    if (action === 'evidence' || action === 'list_evidence') {
      const user = await authenticateToken(req, res);
      if (!user) return;

      const bookingId = query.bookingId;
      if (!bookingId) {
        return res.status(400).json({ success: false, error: 'bookingId is required' });
      }

      const bRows = await sql`SELECT * FROM bookings WHERE id = ${bookingId} OR booking_ref = ${bookingId} LIMIT 1;`;
      if (bRows.length === 0) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      const booking = bRows[0];

      // RBAC: Customer owner, Assigned worker, Admin
      if (user.role === 'customer' && booking.customer_id !== user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not own this booking' });
      }
      if (user.role === 'worker' && booking.worker_id !== user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden: You are not assigned to this booking' });
      }

      const evidenceRows = await sql`
        SELECT id, booking_id, professional_id, customer_id, home_asset_id,
               evidence_type, file_name, mime_type, file_size, caption, created_at
               ${query.includeData ? sql`, data_content` : sql``}
        FROM service_evidence
        WHERE booking_id = ${booking.id}
        ORDER BY created_at ASC;
      `;

      return res.status(200).json({ success: true, evidence: evidenceRows, data: evidenceRows });
    }

    // D. AUTHENTICATED: Get Disputes
    if (action === 'disputes' || action === 'list_disputes') {
      const user = await authenticateToken(req, res);
      if (!user) return;

      const page = Math.max(1, parseInt(query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
      const offset = (page - 1) * limit;
      const statusFilter = query.status;

      let rows;
      if (user.role === 'customer') {
        rows = await sql`
          SELECT d.*, b.booking_ref, b.service_title, w.full_name as professional_name
          FROM disputes d
          JOIN bookings b ON d.booking_id = b.id
          LEFT JOIN profiles w ON d.professional_id = w.id
          WHERE d.customer_id = ${user.id}
          ORDER BY d.created_at DESC
          LIMIT ${limit} OFFSET ${offset};
        `;
      } else if (user.role === 'worker') {
        rows = await sql`
          SELECT d.*, b.booking_ref, b.service_title, c.full_name as customer_name
          FROM disputes d
          JOIN bookings b ON d.booking_id = b.id
          LEFT JOIN profiles c ON d.customer_id = c.id
          WHERE d.professional_id = ${user.id}
          ORDER BY d.created_at DESC
          LIMIT ${limit} OFFSET ${offset};
        `;
      } else {
        // Admin
        if (statusFilter) {
          rows = await sql`
            SELECT d.*, b.booking_ref, b.service_title, c.full_name as customer_name, w.full_name as professional_name
            FROM disputes d
            JOIN bookings b ON d.booking_id = b.id
            LEFT JOIN profiles c ON d.customer_id = c.id
            LEFT JOIN profiles w ON d.professional_id = w.id
            WHERE d.status = ${statusFilter}
            ORDER BY d.created_at DESC
            LIMIT ${limit} OFFSET ${offset};
          `;
        } else {
          rows = await sql`
            SELECT d.*, b.booking_ref, b.service_title, c.full_name as customer_name, w.full_name as professional_name
            FROM disputes d
            JOIN bookings b ON d.booking_id = b.id
            LEFT JOIN profiles c ON d.customer_id = c.id
            LEFT JOIN profiles w ON d.professional_id = w.id
            ORDER BY d.created_at DESC
            LIMIT ${limit} OFFSET ${offset};
          `;
        }
      }

      return res.status(200).json({ success: true, disputes: rows, data: rows });
    }

    // E. AUTHENTICATED: Dispute 360-Degree Detail View
    if (action === 'dispute_detail' || action === 'get_dispute') {
      const user = await authenticateToken(req, res);
      if (!user) return;

      const disputeId = query.id || query.disputeId;
      if (!disputeId) {
        return res.status(400).json({ success: false, error: 'disputeId is required' });
      }

      const dRows = await sql`SELECT * FROM disputes WHERE id = ${disputeId} LIMIT 1;`;
      if (dRows.length === 0) {
        return res.status(404).json({ success: false, error: 'Dispute not found' });
      }
      const dispute = dRows[0];

      // RBAC check: Customer owner, Assigned Pro, or Admin
      if (user.role === 'customer' && dispute.customer_id !== user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not own this dispute' });
      }
      if (user.role === 'worker' && dispute.professional_id !== user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden: You are not the assigned professional' });
      }

      // Aggregate full 360 case context
      const bookingRows = await sql`SELECT * FROM bookings WHERE id = ${dispute.booking_id} LIMIT 1;`;
      const booking = bookingRows[0] || null;

      const customerRows = await sql`SELECT id, full_name, phone, avatar_url FROM profiles WHERE id = ${dispute.customer_id} LIMIT 1;`;
      const proRows = await sql`SELECT id, full_name, phone, trade, rating, avatar_url FROM profiles WHERE id = ${dispute.professional_id} LIMIT 1;`;

      const evidenceRows = await sql`
        SELECT id, booking_id, evidence_type, file_name, mime_type, file_size, caption, created_at
        FROM service_evidence WHERE booking_id = ${dispute.booking_id};
      `;

      const responseRows = await sql`
        SELECT dr.*, p.full_name as responder_name
        FROM dispute_responses dr
        LEFT JOIN profiles p ON dr.responder_id = p.id
        WHERE dr.dispute_id = ${dispute.id}
        ORDER BY dr.created_at ASC;
      `;

      const warrantyRows = await sql`SELECT * FROM service_warranties WHERE booking_id = ${dispute.booking_id} LIMIT 1;`;
      const paymentRows = await sql`SELECT id, order_id, amount, currency, status, method, created_at FROM payments WHERE booking_id = ${dispute.booking_id} LIMIT 1;`;
      const invoiceRows = await sql`SELECT * FROM invoices WHERE booking_id = ${dispute.booking_id} LIMIT 1;`;
      const refundRows = await sql`SELECT * FROM refunds WHERE booking_id = ${dispute.booking_id} LIMIT 1;`;
      const timelineRows = await sql`SELECT * FROM booking_events WHERE booking_id = ${dispute.booking_id} ORDER BY created_at ASC;`;

      let auditLogs = [];
      if (user.role === 'admin') {
        auditLogs = await sql`
          SELECT * FROM audit_logs
          WHERE target_id = ${dispute.id} OR target_id = ${dispute.booking_id}
          ORDER BY created_at DESC LIMIT 20;
        `;
      }

      return res.status(200).json({
        success: true,
        dispute: {
          ...dispute,
          booking,
          customer: customerRows[0] || null,
          professional: proRows[0] || null,
          evidence: evidenceRows,
          responses: responseRows,
          warranty: warrantyRows[0] || null,
          payment: paymentRows[0] || null,
          invoice: invoiceRows[0] || null,
          refund: refundRows[0] || null,
          timeline: timelineRows,
          auditLogs
        }
      });
    }

    // F. Platform Policy Settings
    if (action === 'policy' || action === 'get_policy') {
      const policy = await getTrustPolicy();
      return res.status(200).json({ success: true, policy });
    }

    return res.status(400).json({ success: false, error: 'Unknown action' });
  }

  // ---------------------------------------------------------------------------
  // 2. POST REQUESTS
  // ---------------------------------------------------------------------------
  if (method === 'POST') {
    const user = await authenticateToken(req, res);
    if (!user) return;

    const action = query.action || body.action;

    try {
      // A. Submit Review
      if (action === 'review' || action === 'submit_review') {
        const result = await submitReview({
          bookingId: body.bookingId || body.booking_id,
          customerUser: user,
          rating: body.rating || body.stars,
          comment: body.comment || body.reviewText,
          tags: body.tags || []
        });
        return res.status(201).json({ success: true, ...result, data: result });
      }

      // B. Upload Service Evidence
      if (action === 'upload_evidence' || action === 'evidence') {
        const result = await uploadServiceEvidence({
          bookingId: body.bookingId || body.booking_id,
          actorUser: user,
          evidenceType: body.evidenceType || body.type,
          fileName: body.fileName || body.file_name || 'evidence.jpg',
          mimeType: body.mimeType || body.mime_type || 'image/jpeg',
          fileSize: body.fileSize || body.file_size || 0,
          dataContent: body.dataContent || body.fileData || body.data_content,
          caption: body.caption || '',
          homeAssetId: body.homeAssetId || body.home_asset_id
        });
        return res.status(201).json({ success: true, ...result, data: result });
      }

      // C. Submit Warranty Claim
      if (action === 'create_claim' || action === 'warranty_claim') {
        const result = await createWarrantyClaim({
          warrantyId: body.warrantyId || body.warranty_id,
          bookingId: body.bookingId || body.booking_id,
          customerUser: user,
          issueDescription: body.issueDescription || body.description
        });
        return res.status(201).json({ success: true, ...result, data: result });
      }

      // D. Open Dispute
      if (action === 'create_dispute' || action === 'open_dispute' || action === 'dispute') {
        const result = await createDispute({
          bookingId: body.bookingId || body.booking_id,
          customerUser: user,
          reason: body.reason,
          description: body.description,
          priority: body.priority || 'medium',
          claimId: body.claimId || body.claim_id
        });
        return res.status(201).json({ success: true, ...result, data: result });
      }

      // E. Respond to Dispute
      if (action === 'respond_dispute' || action === 'dispute_response') {
        const result = await respondToDispute({
          disputeId: body.disputeId || body.dispute_id,
          responderUser: user,
          message: body.message || body.response,
          evidenceIds: body.evidenceIds || body.evidence_ids || []
        });
        return res.status(201).json({ success: true, ...result, data: result });
      }

      // F. Resolve Dispute (Admin Only)
      if (action === 'resolve_dispute' || action === 'admin_resolve') {
        const result = await resolveDispute({
          disputeId: body.disputeId || body.dispute_id,
          adminUser: user,
          resolutionType: body.resolutionType || body.resolution_type,
          resolutionNotes: body.resolutionNotes || body.notes || body.resolution_notes,
          refundAmount: body.refundAmount ?? body.amount,
          payoutAdjustment: body.payoutAdjustment ?? body.adjustment
        });
        return res.status(200).json({ success: true, ...result, data: result });
      }

      // G. Update Platform Policy (Admin Only)
      if (action === 'update_policy') {
        if (user.role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
        }
        const updatedPolicy = {
          workmanship_warranty_days: Number(body.workmanship_warranty_days || 30),
          part_warranty_days: Number(body.part_warranty_days || 180),
          claim_window_days: Number(body.claim_window_days || 30),
          no_show_window_hours: Number(body.no_show_window_hours || 24)
        };
        await sql`
          INSERT INTO platform_settings (key, value, description, updated_at)
          VALUES ('trust_warranty_policy', ${JSON.stringify(updatedPolicy)}::jsonb, 'Platform warranty & claim policies', CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE
          SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
        `;
        await createAuditLog({
          actorId: user.id,
          actorName: user.full_name || 'Admin',
          actorRole: 'admin',
          action: 'policy_override',
          targetId: 'trust_warranty_policy',
          details: updatedPolicy
        });
        return res.status(200).json({ success: true, policy: updatedPolicy });
      }

      return res.status(400).json({ success: false, error: 'Unknown action' });
    } catch (err) {
      const code = err.statusCode || 500;
      return res.status(code).json({ success: false, error: err.message });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. PATCH REQUESTS (Moderation, Status Updates)
  // ---------------------------------------------------------------------------
  if (method === 'PATCH') {
    const user = await authenticateToken(req, res);
    if (!user) return;

    const action = query.action || body.action;

    try {
      if (action === 'moderate_review' || action === 'review_status') {
        const result = await moderateReview({
          reviewId: body.reviewId || query.reviewId || body.id,
          status: body.status,
          adminUser: user,
          reason: body.reason || ''
        });
        return res.status(200).json({ success: true, ...result, data: result });
      }

      return res.status(400).json({ success: false, error: 'Unknown action' });
    } catch (err) {
      const code = err.statusCode || 500;
      return res.status(code).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
}
