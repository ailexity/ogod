'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { ok, created, paginated } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const Trip = require('../models/Trip');
const Category = require('../models/Category');

/** Ensure the category slug exists and is active (open value, not an enum). */
async function assertCategoryExists(slug) {
  const cat = await Category.findOne({ slug: String(slug).toLowerCase(), active: true });
  if (!cat) {
    throw ApiError.badRequest(
      `Unknown category "${slug}". Categories are managed in the admin panel.`
    );
  }
  return cat.slug;
}

/** Build the sort spec from the query's `sort` value. */
function sortSpec(sort) {
  switch (sort) {
    case 'departing':
      return { startDate: 1 };
    case 'priceAsc':
      return { pricePerPerson: 1 };
    case 'priceDesc':
      return { pricePerPerson: -1 };
    case 'recent':
    default:
      return { createdAt: -1 };
  }
}

/**
 * GET /api/trips  (public)
 * Browse + search + category filter + "popular near you".
 * Only `live` trips are shown to travelers unless an explicit status filter is
 * passed by an authorized caller (poster viewing own / admin).
 */
const listTrips = asyncHandler(async (req, res) => {
  const { q, category, status, posterId, near, radiusKm, page, limit, sort } = req.query;

  const filter = {};
  await Trip.updateMany(
  {
    endDate: { $lt: new Date() },
    status: "live",
  },
  {
    status: "past",
  }
);

  // Travelers only ever see live trips. A poster/admin may request other
  // statuses (e.g. their own paused listings) — enforced in myListings/admin.
  filter.status = status || 'live';

  if (category) filter.category = String(category).toLowerCase();
  if (posterId) filter.posterId = posterId;
  if (q) {
    filter.$or = [
        {
            $text: {
                $search: q
            }
        },
        {
            destinationName: {
                $regex: q,
                $options: "i"
            }
        }
    ];
}

  // Geospatial "near" filter: near="lng,lat"
  if (near) {
    const [lng, lat] = String(near).split(',').map(Number);
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      filter['destination.geo'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: (radiusKm || 100) * 1000,
        },
      };
    }
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Trip.find(filter)
      .sort(sortSpec(sort))
      .skip(skip)
      .limit(limit)
      .populate('posterId', 'name organizationName')
      .lean(),
    Trip.countDocuments(filter),
  ]);

  return paginated(res, items, { page, limit, total });
});

/**
 * GET /api/trips/shelves  (public)
 * Home feed: a few named horizontally-scrolling shelves.
 */
const homeShelves = asyncHandler(async (req, res) => {
  const base = { status: 'live' };
  const limit = 12;

  const [departingSoon, categories] = await Promise.all([
    Trip.find({ ...base, startDate: { $gte: new Date() } })
      .sort({ startDate: 1 })
      .limit(limit)
      .lean(),
    Category.find({ active: true }).sort({ sortOrder: 1 }).lean(),
  ]);

  // One shelf per active category (only include non-empty shelves).
  const categoryShelves = await Promise.all(
    categories.map(async (cat) => {
      const trips = await Trip.find({ ...base, category: cat.slug })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      return { key: cat.slug, title: cat.label, trips };
    })
  );

  const shelves = [
    { key: 'departing-soon', title: 'Departing soon', trips: departingSoon },
    ...categoryShelves.filter((s) => s.trips.length > 0),
  ];

  return ok(res, { shelves });
});

/** GET /api/trips/:id  (public) */
const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id).populate(
    "posterId",
    "name organizationName mobile"
  );

  if (!trip || trip.status === "deleted")
    throw ApiError.notFound("Trip not found");

  trip.views = (trip.views || 0) + 1;

  await trip.save();

  return ok(res, { trip });
});

/** POST /api/trips  (poster) */
const createTrip = asyncHandler(async (req, res) => {
  const payload = req.body;
payload.category = await assertCategoryExists(payload.category);
if (
    new Date(payload.endDate) <
    new Date(payload.startDate)
   ) 
  {
    throw ApiError.badRequest(
        "End date must be after start date."
    );
   }
  // Check price
  if (payload.pricePerPerson < 0) 
  {
    throw ApiError.badRequest("Invalid trip price.");
  }
  if (payload.totalSeats < 1)
  {
    throw ApiError.badRequest(
        "Total seats must be greater than zero."
    );
  }
  if (payload.pricePerPerson < 0) 
  {
    throw ApiError.badRequest(
        "Price cannot be negative."
    );
  }

payload.seatsRemaining = payload.totalSeats; 

  const trip = await Trip.create({
    ...payload,
    posterId: req.user._id,
  });

  return created(res, { trip });
});

/** Load a trip and confirm the caller owns it (or is admin). */
async function loadOwnedTrip(req) {
  const trip = await Trip.findById(req.params.id);
  if (!trip || trip.status === 'deleted') throw ApiError.notFound('Trip not found');
  const isOwner = String(trip.posterId) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only manage your own listings');
  }
  return trip;
}

/** PATCH /api/trips/:id  (poster owner / admin) */
const updateTrip = asyncHandler(async (req, res) => {
  const trip = await loadOwnedTrip(req);
  const updates = req.body;

  if (updates.category) {
    updates.category = await assertCategoryExists(updates.category);
  }

  if (trip.status === "deleted")
  {
  throw ApiError.badRequest(
    "Deleted trips cannot be edited."
  );
  }
if (
    trip.status === "live" &&
    trip.endDate < new Date()
  ) 
  {
    trip.status = "past";
    await trip.save();
  }
  // Update seats safely
if (updates.totalSeats !== undefined) {
    const bookedSeats = trip.totalSeats - trip.seatsRemaining;

    if (updates.totalSeats < bookedSeats) {
        throw ApiError.badRequest(
            "Total seats cannot be less than already booked seats."
        );
    }

    trip.seatsRemaining =
        updates.totalSeats - bookedSeats;

    trip.totalSeats = updates.totalSeats;
}

  delete updates.totalSeats;

  if (trip.startDate <= new Date()) 
  {
    throw ApiError.badRequest(
        "Trip cannot be edited after it has started."
    );
  }

  Object.assign(trip, updates);
  await trip.save();
  return ok(res, { trip });
});

/** POST /api/trips/:id/pause  and  /resume */
const setStatus = (status) =>
  asyncHandler(async (req, res) => {
    const trip = await loadOwnedTrip(req);
    trip.status = status;
    await trip.save();
    return ok(res, { trip });
  });

/** DELETE /api/trips/:id — soft delete (keeps leads intact). */
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await loadOwnedTrip(req);
  trip.status = 'deleted';
  await trip.save();
  return ok(res, { id: trip._id, status: trip.status });
});

/** GET /api/trips/mine — the poster's own active + past listings dashboard. */
const myListings = asyncHandler(async (req, res) =>
  {
  if (payload.totalSeats <= 0) 
  {
  throw ApiError.badRequest(
    "Total seats must be greater than zero."
  );
}
  const trips = await Trip.find({
    posterId: req.user._id,
    status: { $ne: 'deleted' },
  })
   .sort
    ({
    startDate: 1,
    createdAt: -1
    })
    .lean();

  const active = trips.filter((t) => t.status === 'live' || t.status === 'paused');
  const past = trips.filter((t) => t.status === 'past');

  return ok(res, { active, past });
});

module.exports = {
  listTrips,
  homeShelves,
  getTrip,
  createTrip,
  updateTrip,
  pauseTrip: setStatus('paused'),
  resumeTrip: setStatus('live'),
  deleteTrip,
  myListings,
};
