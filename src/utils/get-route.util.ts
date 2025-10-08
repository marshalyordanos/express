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

// *************************** how to use *********************************
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

// ************************* response body ***********************************
/**
 {
    "bbox": [
        -74.053289,
        40.744759,
        -74.034394,
        40.759935
    ],
    "routes": [
        {
            "summary": {
                "distance": 2775.8,
                "duration": 334.8
            },
            "segments": [
                {
                    "distance": 2775.8,
                    "duration": 334.8,
                    "steps": [
                        {
                            "distance": 1907.2,
                            "duration": 186.9,
                            "type": 11,
                            "instruction": "Head northeast on Summit Avenue",
                            "name": "Summit Avenue",
                            "way_points": [
                                0,
                                27
                            ]
                        },
                        {
                            "distance": 526.2,
                            "duration": 94.7,
                            "type": 1,
                            "instruction": "Turn right onto 10th Street",
                            "name": "10th Street",
                            "way_points": [
                                27,
                                33
                            ]
                        },
                        {
                            "distance": 35.9,
                            "duration": 3.7,
                            "type": 0,
                            "instruction": "Turn left onto New York Avenue, CR 672",
                            "name": "New York Avenue, CR 672",
                            "way_points": [
                                33,
                                34
                            ]
                        },
                        {
                            "distance": 128.8,
                            "duration": 23.2,
                            "type": 1,
                            "instruction": "Turn right onto 10th Street",
                            "name": "10th Street",
                            "way_points": [
                                34,
                                35
                            ]
                        },
                        {
                            "distance": 118.7,
                            "duration": 12.2,
                            "type": 0,
                            "instruction": "Turn left onto Palisade Avenue, CR 685",
                            "name": "Palisade Avenue, CR 685",
                            "way_points": [
                                35,
                                38
                            ]
                        },
                        {
                            "distance": 59.1,
                            "duration": 14.2,
                            "type": 1,
                            "instruction": "Turn right",
                            "name": "-",
                            "way_points": [
                                38,
                                41
                            ]
                        },
                        {
                            "distance": 0,
                            "duration": 0,
                            "type": 10,
                            "instruction": "Arrive at your destination, on the left",
                            "name": "-",
                            "way_points": [
                                41,
                                41
                            ]
                        }
                    ]
                }
            ],
            "bbox": [
                -74.053289,
                40.744759,
                -74.034394,
                40.759935
            ],
            "geometry": "w}twF`p~bM??uD{B}ByA}BwA_CuAeC}A}BwA}BuA{BsAuBqAyBuAwBoAuBoA}ByA}ByAaCwA_CuA{BwA}BuAoAu@{@e@a@YcBiAmAu@m@]uBwAoEsCr@gCdAqDDOdBcGdB_GdBgGy@g@dBqGsBkAGCcAk@^eBAOGE",
            "way_points": [
                0,
                41
            ]
        }
    ],
    "metadata": {
        "attribution": "openrouteservice.org | OpenStreetMap contributors",
        "service": "routing",
        "timestamp": 1759934250267,
        "query": {
            "coordinates": [
                [
                    -74.05329,
                    40.74476
                ],
                [
                    -74.0345,
                    40.7585
                ]
            ],
            "profile": "driving-car",
            "profileName": "driving-car",
            "preference": "shortest",
            "format": "json"
        },
        "engine": {
            "version": "9.3.0",
            "build_date": "2025-06-06T15:39:25Z",
            "graph_date": "2025-10-05T11:13:35Z",
            "osm_date": "2025-09-29T00:00:01Z"
        }
    }
}
 */
