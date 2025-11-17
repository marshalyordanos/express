"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoute = getRoute;
const axios_1 = require("axios");
async function getRoute(start, end) {
    const baseUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';
    const apiKey = process.env.OPENROUTESERVICE_API_KEY ||
        'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjgwMmU3YTY3MDMwMjRlZjViNWE4MzczYzE3ZGZlNDBkIiwiaCI6Im11cm11cjY0In0=';
    try {
        const response = await axios_1.default.post(baseUrl, {
            coordinates: [
                [start.lng, start.lat],
                [end.lng, end.lat],
            ],
            preference: 'shortest',
        }, {
            headers: {
                Authorization: apiKey,
                'Content-Type': 'application/json; charset=utf-8',
                Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('OpenRouteService Error:', error.response?.data || error.message);
        throw new Error('Error fetching route from OpenRouteService');
    }
}
//# sourceMappingURL=get-route.util.js.map