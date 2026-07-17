'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Issue a role-based JWT. Keep the payload minimal — id + role are enough for
 * authorization; everything else is looked up from the DB.
 */
function signToken(user) 
{
return jwt.sign(
    {
        sub: String(user._id),
        role: user.role
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
    return jwt.sign(
        {
            sub: String(user._id)
        },
        env.jwt.secret,
        {
            expiresIn: "30d",
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
        error.statusCode = 401;
        throw error;
    }
}

module.exports =
{
    signToken,
    signRefreshToken,
    verifyToken
};
