'use strict';

const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/db');

let server;

async function start() {
  try {
    await connectDB();
    server = app.listen(env.port, () => {
      logger.info(`Ogod API listening on http://localhost:${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    await disconnectDB();

    process.exit(0);

  } catch (err) {
    logger.error("Shutdown failed:", err);

    process.exit(1);
  }
}

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));

process.on("unhandledRejection", async (reason) => {

    logger.error("Unhandled Rejection:", reason);

    await shutdown("UNHANDLED_REJECTION");

});

process.on("uncaughtException", async (error) => {

    logger.error("Uncaught Exception:", error);

    await shutdown("UNCAUGHT_EXCEPTION");

});

process.on('warning', (warning) => {
  logger.warn(`Warning: ${warning.name} - ${warning.message}`);
});

start();
