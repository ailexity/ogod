'use strict';

const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * SMS delivery abstraction. Phase 1 supports MSG91 and Twilio; provider is
 * chosen via SMS_PROVIDER. When provider is `none` (or dev mode), we just log —
 * the OTP is surfaced in the API response for local testing.
 *
 * Real HTTP calls are intentionally left as clearly-marked TODOs so wiring a
 * live provider is a small, contained change.
 */
async function sendOtpSms(mobile, code) {
  const provider = env.sms.provider;

  if (provider === 'none') {
    logger.info(`[sms:none] OTP for ${mobile} is ${code}`);
    return { delivered: false, provider };
  }

  if (provider === 'msg91') {
    // TODO: POST https://api.msg91.com/api/v5/otp with authKey/templateId.
    logger.info(`[sms:msg91] (stub) would send OTP ${code} to ${mobile}`);
    return { delivered: true, provider };
  }

  if (provider === 'twilio') {
    // TODO: use twilio SDK client.messages.create({ to, from, body }).
    logger.info(`[sms:twilio] (stub) would send OTP ${code} to ${mobile}`);
    return { delivered: true, provider };
  }

  logger.warn(`Unknown SMS_PROVIDER "${provider}", falling back to log.`);
  logger.info(`[sms:fallback] OTP for ${mobile} is ${code}`);
  return { delivered: false, provider: 'none' };
}

module.exports = { sendOtpSms };
