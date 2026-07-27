'use strict';

const axios = require('axios');
const GeoCache = require('../models/geoCache');
const env = require('../config/env');

/**
 * Returns:
 * {
 *   lat,
 *   lng,
 *   formattedAddress,
 *   placeId,
 *   cached
 * }
 */
async function geocodeLocation(query) {
    if (!query || typeof query !== 'string') {
        throw new Error('Location is required.');
    }

    const normalizedQuery = query
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();

    if (!normalizedQuery) {
        throw new Error('Location is required.');
    }

    if (!env.googleMapsApiKey) {
        throw new Error('Google Maps API key is not configured.');
    }

    // Check cache first
    const cached = await GeoCache.findOne({
        query: normalizedQuery
    }).lean();

    if (cached) {
        return {
            lat: cached.location.lat,
            lng: cached.location.lng,
            formattedAddress: cached.formattedAddress,
            placeId: cached.placeId,
            cached: true
        };
    }

    let response;

    try {
        response = await axios.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            {
                params: {
                    address: query,
                    key: env.googleMapsApiKey
                },
                timeout: 10000
            }
        );
    } catch (err) {
        throw new Error('Unable to connect to Google Maps service.');
    }

    if (!response || !response.data) {
        throw new Error('Invalid response from Google Maps.');
    }

    if (response.data.status !== 'OK') {
        throw new Error(
            `Google Maps Error: ${response.data.status}`
        );
    }

    if (!response.data.results.length) {
        throw new Error('Location not found.');
    }

    const result = response.data.results[0];

    const geo = {
        query: normalizedQuery,
        formattedAddress: result.formatted_address,
        location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
        },
        placeId: result.place_id
    };

    // Save cache (don't fail request if caching fails)
    try {
        await GeoCache.findOneAndUpdate(
            { query: normalizedQuery },
            geo,
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );
    } catch (err) {
        console.error(
            'GeoCache save failed:',
            err.message
        );
    }

    return {
        lat: geo.location.lat,
        lng: geo.location.lng,
        formattedAddress: geo.formattedAddress,
        placeId: geo.placeId,
        cached: false
    };
}

module.exports = {
    geocodeLocation
};
