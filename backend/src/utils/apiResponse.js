'use strict';

/**
 * Uniform success envelope so both clients can rely on a stable shape:
 *   { success: true, data, meta? }
 */
function ok(res, data, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.json(body);
}

function created(res, data) {
  return res.status(201).json({ success: true, data });
}

function paginated(res, items, { page, limit, total }) {
  return res.json({
    success: true,
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

module.exports = { ok, created, paginated };
