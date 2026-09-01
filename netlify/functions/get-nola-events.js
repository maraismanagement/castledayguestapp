// Tonight's live music in New Orleans, from WWOZ's Livewire calendar.
//
// Ported from the Marais guest app, which has been running this since Aug
// 2026. It replaces a neworleans.com Simpleview implementation that had been
// returning an empty array on every call.
//
// Why WWOZ and not neworleans.com: their events API sits behind Akamai, which
// returns 403 to datacenter traffic. It answers from a residential connection
// and then rate-limits, so it cannot be called from a function at all. WWOZ
// publishes the Livewire listings as plain HTML and is reachable, and for a
// guest app it is better data anyway: who is playing, where, and at what time,
// refreshed by WWOZ every day.
//
// The guest app treats this as additive. If this returns nothing the home page
// still shows its own calendar, so an outage here is not guest-visible.

const LIVEWIRE_URL = 'https://www.wwoz.org/calendar/livewire-music';
const LIMIT = 30;

const MONTHS = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
};

function clean(s) {
  return String(s == null ? '' : s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&hellip;/g, '…')
    .replace(/\s+/g, ' ')
    .trim();
}

// Minutes past midnight, with after-midnight sets sorted after the evening
// rather than before breakfast.
function minutesOfDay(text) {
  const m = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i.exec(text || '');
  if (!m) return null;
  let hour = (+m[1]) % 12;
  if (/pm/i.test(m[3])) hour += 12;
  if (hour < 6) hour += 24;
  return hour * 60 + (+(m[2] || 0));
}

function pad(n) { return (n < 10 ? '0' : '') + n; }

function centralParts() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const got = {};
  parts.forEach(p => { got[p.type] = p.value; });
  return { year: +got.year, month: +got.month, day: +got.day };
}

// Livewire prints a month and day with no year. Anchor it to today in New
// Orleans and roll the year over at the end of December.
function resolveDate(month, day, todayParts) {
  let year = todayParts.year;
  if (todayParts.month === 12 && month === 1) year += 1;
  else if (todayParts.month === 1 && month === 12) year -= 1;
  return year + '-' + pad(month) + '-' + pad(day);
}

function parseLivewire(html, todayParts) {
  const listing = html.split('livewire-listing')[1] || '';
  const panels = listing.split(/<div class="panel panel-default">/).slice(1);
  const shows = [];

  panels.forEach(panel => {
    const venueMatch = /<h3 class="panel-title">\s*<a href="[^"]*"[^>]*>([\s\S]*?)<\/a>/.exec(panel);
    if (!venueMatch) return;
    const venue = clean(venueMatch[1]);
    if (!venue) return;

    // One panel per venue, one row per set.
    const rows = panel.split(/<div class="col-xs-2 calendar-page">/).slice(1);

    rows.forEach(row => {
      const monthMatch = /<div class="month">\s*([A-Za-z]{3})/.exec(row);
      const dayMatch = /<div class="day">\s*(\d{1,2})/.exec(row);
      const actMatch = /<p class="truncate">\s*<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/.exec(row);
      if (!monthMatch || !dayMatch || !actMatch) return;

      const month = MONTHS[monthMatch[1]];
      if (!month) return;

      const artist = clean(actMatch[2]);
      if (!artist) return;

      const whenMatch = /<\/a>\s*<\/p>\s*<p>([\s\S]*?)<\/p>/.exec(row);
      const whenText = clean(whenMatch ? whenMatch[1] : '');
      const timeMatch = /(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i.exec(whenText);
      const times = timeMatch ? timeMatch[1].toLowerCase().replace(/\s+/g, '') : '';

      shows.push({
        title: artist,
        location: venue,
        startDate: resolveDate(month, +dayMatch[1], todayParts),
        endDate: '',
        times: times,
        sortKey: minutesOfDay(times),
        category: 'Live Music',
        teaser: '',
        link: /^https?:/.test(actMatch[1]) ? actMatch[1] : 'https://www.wwoz.org' + actMatch[1],
        source: 'WWOZ Livewire'
      });
    });
  });

  shows.sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1;
    const ak = a.sortKey == null ? 99999 : a.sortKey;
    const bk = b.sortKey == null ? 99999 : b.sortKey;
    if (ak !== bk) return ak - bk;
    return a.location.localeCompare(b.location);
  });

  return shows.slice(0, LIMIT);
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=1800, s-maxage=1800',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const res = await fetch(LIVEWIRE_URL, {
      headers: {
        'User-Agent': 'CastleDayGuestApp/1.0 (+https://castleday.netlify.app)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!res.ok) throw new Error('livewire returned ' + res.status);

    const html = await res.text();
    const events = parseLivewire(html, centralParts());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        events,
        source: 'WWOZ Livewire',
        sourceUrl: LIVEWIRE_URL,
        fetchedAt: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error('Livewire fetch failed:', error.message);
    return {
      statusCode: 200,
      headers: Object.assign({}, headers, { 'Cache-Control': 'public, max-age=300' }),
      body: JSON.stringify({ events: [], error: 'upstream unavailable', detail: error.message }),
    };
  }
};
