'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Issue a role-based JWT. Keep the payload minimal — id + role are enough for
 * authorization; everything else is looked up from the DB.
 */
function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret);
}

module.exports = { signToken, verifyToken };
