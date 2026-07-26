'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

const {
    geocodeLocation
} = require('../services/mapsService');

/**
 * GET /api/maps/geocode?address=Mumbai
 */
const geocode = asyncHandler(async (req, res) => {
    const { address } = req.query;

    if (!address || !address.trim()) {
        throw ApiError.badRequest(
            'Address is required.'
        );
    }

    const result = await geocodeLocation(address);

    return ok(res, {
        location: result
    });
});

module.exports =
{
    geocode
};
