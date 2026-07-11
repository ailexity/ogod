'use strict';

/**
 * Tiny leveled logger. Kept dependency-free on purpose — swap for pino/winston
 * later without touching call sites.
 */
const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const current = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function log(level, ...args) {
  if (levels[level] > levels[current]) return;
  const ts = new Date().toISOString();
  const line = `[${ts}] ${level.toUpperCase()}`;
  // eslint-disable-next-line no-console
  (console[level] || console.log)(line, ...args);
}

module.exports = {
  error: (...a) => log('error', ...a),
  warn: (...a) => log('warn', ...a),
  info: (...a) => log('info', ...a),
  debug: (...a) => log('debug', ...a),
};
