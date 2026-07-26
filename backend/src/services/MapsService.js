'use strict';

const axios = require('axios');

const GeoCache = require('../models/geocache');
const env = require('../config/env');

async function geocodeLocation(query) {
    if (!query || !query.trim()) {
        throw new Error('Location is required.');
    }

    const normalizedQuery = query.trim().toLowerCase();

    // Check cache first
    const cached = await GeoCache.findOne({
        query: normalizedQuery
    });

    if (cached) {
        return {
            lat: cached.location.lat,
            lng: cached.location.lng,
            formattedAddress: cached.formattedAddress,
            placeId: cached.placeId,
            cached: true
        };
    }

    const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
            params: {
                address: query,
                key: env.googleMapsApiKey
            }
        }
    );

    if (
        response.data.status !== 'OK' ||
        !response.data.results.length
    ) {
        throw new Error('Unable to geocode location.');
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

    await GeoCache.create(geo);

    return {
        lat: geo.location.lat,
        lng: geo.location.lng,
        formattedAddress: geo.formattedAddress,
        placeId: geo.placeId,
        cached: false
    };
}

module.exports = 
{
    geocodeLocation
};
