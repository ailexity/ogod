'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Issue a role-based JWT. Keep the payload minimal — id + role are enough for
 * authorization; everything else is looked up from the DB.
 */
function signToken(user)
{
    if (!user || !user._id) {
        throw new Error("Invalid user supplied to signToken()");
    }

    return jwt.sign(
        {
            sub: String(user._id),
            role: user.role,
            type: "access"
        },
        env.jwt.secret,
        {
            expiresIn: env.jwt.expiresIn,
            issuer: "Ogod",
            audience: "Ogod-Mobile-App"
        }
    );
}
function signRefreshToken(user)
{
    if (!user || !user._id) {
        throw new Error("Invalid user supplied to signRefreshToken()");
    }

    return jwt.sign(
        {
            sub: String(user._id),
            type: "refresh"
        },
        env.jwt.secret,
        {
            expiresIn: env.jwt.refreshExpiresIn || "30d",
            issuer: "Ogod",
            audience: "Ogod-Mobile-App"
        }
    );
}
function verifyToken(token)
{
    try {
        return jwt.verify(token, env.jwt.secret, 
        {
            issuer: "Ogod",
            audience: "Ogod-Mobile-App"
        });
    } 
   catch (error)
{
    const err = new Error("Invalid or expired token");
    err.statusCode = 401;
    throw err;
}
}

module.exports =
{
    signToken,
    signRefreshToken,
    verifyToken
};
