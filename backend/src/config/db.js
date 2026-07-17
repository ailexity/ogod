'use strict';

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB Atlas. Retries are handled by the driver; we surface a
 * clear message and exit on the initial failure so orchestrators can restart.
 */
async function connectDB() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  }
  if (/[<>]/.test(env.mongoUri)) {
    throw new Error(
      'MONGODB_URI still contains placeholder tokens like <user>, <pass>, or <cluster>. Replace it with your real MongoDB Atlas URI, or use mongodb://localhost:27017/ogod for a local MongoDB server.'
    );
  }

  mongoose.set('strictQuery', false);

  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error', err.message));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  });

  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.connection.close();
}

module.exports = { connectDB, disconnectDB };
