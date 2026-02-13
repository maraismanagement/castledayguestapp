// Guesty API integration for guest lookup
const GUESTY_CLIENT_ID = process.env.GUESTY_CLIENT_ID;
const GUESTY_CLIENT_SECRET = process.env.GUESTY_CLIENT_SECRET;

// Get OAuth token from Guesty
async function getGuestyToken() {
  const response = await fetch('https://open-api.guesty.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: GUESTY_CLIENT_ID,
      client_secret: GUESTY_CLIENT_SECRET,
      scope: 'open-api',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get Guesty token');
  }

  const data = await response.json();
  return data.access_token;
}

// Search for reservations by guest name
async function searchReservations(token, guestName) {
  const today = new Date().toISOString().split('T')[0];

  // Search for current and upcoming reservations
  const response = await fetch(
    `https://open-api.guesty.com/v1/reservations?` + new URLSearchParams({
      q: guestName,
      checkInFrom: today,
      limit: 10,
    }),
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search reservations');
  }

  return response.json();
}

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { guestName } = JSON.parse(event.body);

    if (!guestName || guestName.trim().length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Please enter your name' }),
      };
    }

    // Get token and search
    const token = await getGuestyToken();
    const results = await searchReservations(token, guestName.trim());

    // Filter to only active/confirmed reservations
    const activeReservations = (results.results || []).filter(res =>
      ['confirmed', 'checked_in'].includes(res.status)
    );

    if (activeReservations.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'No active reservation found. Please check your name matches your booking.'
        }),
      };
    }

    // Return simplified reservation data
    const reservations = activeReservations.map(res => ({
      id: res._id,
      guestName: res.guest?.fullName || guestName,
      checkIn: res.checkIn,
      checkOut: res.checkOut,
      listingName: res.listing?.title || 'CastleDay',
      status: res.status,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reservations }),
    };

  } catch (error) {
    console.error('Guesty lookup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Unable to look up reservation. Please try again.' }),
    };
  }
};
