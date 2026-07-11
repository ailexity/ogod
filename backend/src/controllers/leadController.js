'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { ok, created, paginated } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const Lead = require('../models/Lead');
const Trip = require('../models/Trip');

/**
 * Build a pre-filled WhatsApp deep link + a tel: link for a trip. Revealed to
 * the traveler only after the inquiry form is submitted.
 */
function buildContactLinks(trip, poster) {
  const mobile = poster?.mobile;
  const text = encodeURIComponent(
    `Hi! I'm interested in your trip "${trip.title}" (${trip.destination?.name}) on Ogod.`
  );
  return {
    whatsapp: mobile ? `https://wa.me/${mobile}?text=${text}` : null,
    call: mobile ? `tel:+${mobile}` : null,
    posterName: poster?.organizationName || poster?.name || null,
  };
}

/**
 * POST /api/leads  (public)
 * Traveler submits the inquiry form. Saves the lead, then returns the poster's
 * WhatsApp/call links so the client can reveal the contact CTAs.
 */
const createLead = asyncHandler(async (req, res) => {
  const { tripId, travelerName, travelerMobile, destinationInterest, requirements } = req.body;

  const trip = await Trip.findById(tripId).populate('posterId', 'name organizationName mobile');
  if (!trip || trip.status === 'deleted') throw ApiError.notFound('Trip not found');

  const lead = await Lead.create({
    tripId: trip._id,
    posterId: trip.posterId._id,
    tripTitle: trip.title,
    travelerName,
    travelerMobile,
    destinationInterest: destinationInterest || trip.destination?.name,
    requirements,
  });

  const contact = buildContactLinks(trip, trip.posterId);

  return created(res, { lead, contact });
});

/**
 * GET /api/leads  (admin)
 * Full lead table with date/destination/category/trip filters + pagination.
 */
const listLeads = asyncHandler(async (req, res) => {
  const { from, to, destination, category, tripId, posterId, page, limit } = req.query;

  const filter = {};
  if (tripId) filter.tripId = tripId;
  if (posterId) filter.posterId = posterId;
  if (destination) filter.destinationInterest = new RegExp(destination, 'i');
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) filter.createdAt.$lte = to;
  }

  // Category lives on the trip, not the lead — resolve matching trip ids first.
  if (category) {
    const tripIds = await Trip.find({ category: String(category).toLowerCase() }).distinct('_id');
    filter.tripId = filter.tripId
      ? { $in: tripIds.filter((id) => String(id) === String(filter.tripId)) }
      : { $in: tripIds };
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('tripId', 'title category destination')
      .populate('posterId', 'name organizationName mobile')
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return paginated(res, items, { page, limit, total });
});

/**
 * GET /api/leads/export  (admin)
 * Streams the filtered leads as CSV for download.
 */
const exportLeads = asyncHandler(async (req, res) => {
  const { from, to, destination, category, posterId } = req.query;

  const filter = {};
  if (posterId) filter.posterId = posterId;
  if (destination) filter.destinationInterest = new RegExp(destination, 'i');
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) filter.createdAt.$lte = to;
  }
  if (category) {
    const tripIds = await Trip.find({ category: String(category).toLowerCase() }).distinct('_id');
    filter.tripId = { $in: tripIds };
  }

  const leads = await Lead.find(filter)
    .sort({ createdAt: -1 })
    .populate('tripId', 'title category destination')
    .lean();

  const header = [
    'Created At',
    'Traveler Name',
    'Traveler Mobile',
    'Trip',
    'Category',
    'Destination',
    'Requirements',
  ];

  const escape = (v) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const rows = leads.map((l) =>
    [
      new Date(l.createdAt).toISOString(),
      l.travelerName,
      l.travelerMobile,
      l.tripTitle || l.tripId?.title,
      l.tripId?.category,
      l.destinationInterest || l.tripId?.destination?.name,
      l.requirements,
    ]
      .map(escape)
      .join(',')
  );

  const csv = [header.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="ogod-leads-${Date.now()}.csv"`);
  return res.send(csv);
});

/** GET /api/leads/mine  (poster) — leads for the poster's own trips. */
const myLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find({ posterId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('tripId', 'title destination')
    .lean();
  return ok(res, { leads });
});

module.exports = { createLead, listLeads, exportLeads, myLeads };
