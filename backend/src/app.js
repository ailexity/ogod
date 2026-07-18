'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

function isAllowedOrigin(origin) {
  if (env.corsOrigins.includes(origin)) return true;

  if (!env.isProd) {
    try {
      const url = new URL(origin);
      const isLocalHost = ['localhost', '127.0.0.1'].includes(url.hostname);
      const isVitePort = Number(url.port) >= 5173 && Number(url.port) <= 5199;
      return url.protocol === 'http:' && isLocalHost && isVitePort;
    } catch {
      return false;
    }
  }

  return false;
}

// Behind Railway/Render/CloudFront we sit behind a proxy — trust it so rate
// limiting and req.ip work correctly.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser clients (mobile app, curl) which send no origin.
      if (!origin) return cb(null, true);
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");
app.use(morgan(env.isProd ? 'combined' : 'dev'));

// Global, generous rate limit as a backstop (auth has its own tighter limit).
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (_req, res) =>
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime(), env: env.nodeEnv } })
);

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
