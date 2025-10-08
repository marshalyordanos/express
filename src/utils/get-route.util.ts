import axios from 'axios';

export async function getRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
) {
  const baseUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';
  const apiKey =
    process.env.OPENROUTESERVICE_API_KEY ||
    'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjgwMmU3YTY3MDMwMjRlZjViNWE4MzczYzE3ZGZlNDBkIiwiaCI6Im11cm11cjY0In0=';

  try {
    const response = await axios.post(
      baseUrl,
      {
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
        preference: 'shortest',
      },
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json; charset=utf-8',
          Accept:
            'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      'OpenRouteService Error:',
      error.response?.data || error.message,
    );
    throw new Error('Error fetching route from OpenRouteService');
  }
}

// how to use
/**
 import { getRoute } from './utils/get-route.util';

async function example() {
  const start = { lat: 40.74056, lng: -74.05635 };
  const end = { lat: 40.7585, lng: -74.0345 };

  try {
    const route = await getRoute(start, end);
    console.log('Route distance:', route?.routes?.[0]?.summary?.distance, 'meters');
  } catch (err) {
    console.error('Route fetch failed:', err.message);
  }
}

example();

 */
