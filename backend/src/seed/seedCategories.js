'use strict';

/**
 * Seed the open-ended category list and (optionally) bootstrap an admin user.
 * Categories are deliberately data, not code — this file just gives you a
 * sensible starting set. Add/rename/deactivate freely from the admin panel.
 *
 *   npm run seed
 */
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const env = require('../config/env');
const logger = require('../utils/logger');
const Category = require('../models/Category');
const User = require('../models/User');
const { normalizeMobile } = require('../services/otpService');

const CATEGORIES = [
  { slug: 'pilgrimage', label: 'Pilgrimage', sortOrder: 10 },
  { slug: 'trek', label: 'Trek', sortOrder: 20 },
  { slug: 'adventure', label: 'Adventure', sortOrder: 30 },
  { slug: 'weekend-getaway', label: 'Weekend Getaway', sortOrder: 40 },
  { slug: 'family-holiday', label: 'Family Holiday', sortOrder: 50 },
  { slug: 'group-tour', label: 'Group Tour', sortOrder: 60 },
  { slug: 'corporate-outing', label: 'Corporate Outing', sortOrder: 70 },
  { slug: 'leisure', label: 'Leisure', sortOrder: 80 },
];

async function seedCategories() {
  let created = 0;
  for (const cat of CATEGORIES) {
    const res = await Category.updateOne(
      { slug: cat.slug },
      { $setOnInsert: { ...cat, active: true } },
      { upsert: true }
    );
    if (res.upsertedCount) created += 1;
  }
  logger.info(`Categories: ${created} created, ${CATEGORIES.length - created} already present.`);
}

async function bootstrapAdmin() {
  if (!env.adminMobile) {
    logger.warn('ADMIN_MOBILE not set — skipping admin bootstrap.');
    return;
  }
  const rawMobile = String(env.adminMobile).replace(/\D/g, '');
  const mobile = normalizeMobile(env.adminMobile);
  const existing = await User.findOne({ mobile });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      logger.info(`Promoted existing user ${mobile} to admin.`);
    } else {
      logger.info(`Admin ${mobile} already present.`);
    }
    return;
  }
  const legacy = rawMobile !== mobile ? await User.findOne({ mobile: rawMobile }) : null;
  if (legacy) {
    legacy.mobile = mobile;
    legacy.role = 'admin';
    legacy.isVerified = true;
    await legacy.save();
    logger.info(`Normalized and promoted existing admin user ${rawMobile} -> ${mobile}.`);
    return;
  }
  await User.create({
    mobile,
    name: 'Ogod Admin',
    role: 'admin',
    isVerified: true,
  });
  logger.info(`Created admin user ${mobile} (log in via OTP with this number).`);
}

async function run() {
  await connectDB();
  try {
    await seedCategories();
    await bootstrapAdmin();
    logger.info('Seed complete.');
  } finally {
    await disconnectDB();
    await mongoose.disconnect().catch(() => {});
  }
}

run().catch((err) => {
  logger.error('Seed failed:', err.message);
  process.exit(1);
});
