// Guest Info - Fetches reservation details from Guesty API
// Personalizes the experience with guest name and door code
// SECURITY: Blocks access to sensitive info after checkout

const API_BASE = '/.netlify/functions';

// Get property slug from the current URL
function getPropertySlug() {
  const path = window.location.pathname;
  const match = path.match(/\/properties\/([^\/]+?)\.html/);
  if (match) {
    return match[1];
  }
  return null;
}

// Fetch guest info by property (auto-detects current guest)
async function fetchGuestInfoByProperty(propertySlug) {
  try {
    const response = await fetch(`${API_BASE}/get-current-guest?property=${propertySlug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch guest info');
    }
    const data = await response.json();
    if (data.noGuest) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch guest info:', error);
    return null;
  }
}

// Check if reservation is still active
function isReservationActive(checkOut) {
  if (!checkOut) return true;
  const checkoutDate = new Date(checkOut);
  const now = new Date();
  checkoutDate.setHours(checkoutDate.getHours() + 24);
  return now < checkoutDate;
}

// Check if reservation hasn't started yet
function isBeforeCheckIn(checkIn) {
  if (!checkIn) return false;
  const checkinDate = new Date(checkIn);
  const now = new Date();
  checkinDate.setHours(0, 0, 0, 0);
  return now < checkinDate;
}

// Show the "stay ended" screen
function showStayEndedScreen(guestName) {
  const firstName = guestName ? guestName.split(' ')[0] : 'friend';

  const overlay = document.createElement('div');
  overlay.className = 'stay-ended-overlay';
  overlay.innerHTML = `
    <div class="stay-ended-content">
      <h1>Thanks for staying with us, ${firstName}!</h1>
      <p>We hope you had an amazing time.</p>
      <p class="stay-ended-message">
        Your reservation has ended, so this page is no longer accessible.
        We'd love to host you again!
      </p>
      <p class="stay-ended-signature">
        Till next time,<br>
        <strong>The CastleDay Team</strong>
      </p>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .stay-ended-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--cream);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .stay-ended-content {
      text-align: center;
      max-width: 400px;
    }
    .stay-ended-content h1 {
      font-family: 'Advercase', sans-serif;
      font-size: 1.5rem;
      font-weight: bold;
      text-transform: uppercase;
      color: var(--red);
      margin-bottom: 16px;
    }
    .stay-ended-content p {
      color: var(--red);
      margin-bottom: 12px;
      line-height: 1.6;
    }
    .stay-ended-message {
      border: 2px solid var(--red);
      padding: 20px;
      margin: 24px 0;
      font-size: 0.9rem;
    }
    .stay-ended-signature {
      font-size: 0.95rem;
      margin-top: 24px;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);
}

// Show "too early" screen
function showTooEarlyScreen(guestName, checkIn) {
  const firstName = guestName ? guestName.split(' ')[0] : 'there';
  const checkInDate = new Date(checkIn);
  const formattedDate = checkInDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const overlay = document.createElement('div');
  overlay.className = 'stay-ended-overlay';
  overlay.innerHTML = `
    <div class="stay-ended-content">
      <h1>Hey ${firstName}!</h1>
      <p>We're excited to host you!</p>
      <p class="stay-ended-message">
        Your property info will be available starting on <strong>${formattedDate}</strong> at check-in time.
        <br><br>
        Check back then for your door code, WiFi info, and house guide!
      </p>
      <p class="stay-ended-signature">
        See you soon,<br>
        <strong>The CastleDay Team</strong>
      </p>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .stay-ended-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--cream);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .stay-ended-content {
      text-align: center;
      max-width: 400px;
    }
    .stay-ended-content h1 {
      font-family: 'Advercase', sans-serif;
      font-size: 1.5rem;
      font-weight: bold;
      text-transform: uppercase;
      color: var(--red);
      margin-bottom: 16px;
    }
    .stay-ended-content p {
      color: var(--red);
      margin-bottom: 12px;
      line-height: 1.6;
    }
    .stay-ended-message {
      border: 2px solid var(--red);
      padding: 20px;
      margin: 24px 0;
      font-size: 0.9rem;
    }
    .stay-ended-signature {
      font-size: 0.95rem;
      margin-top: 24px;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);
}

// Show door code if available
function showDoorCode(lockCode) {
  if (!lockCode) return;

  const checkinSection = document.getElementById('checkin');
  if (!checkinSection) return;

  let codeBox = checkinSection.querySelector('.door-code-box');
  if (!codeBox) {
    codeBox = document.createElement('div');
    codeBox.className = 'info-block door-code-box';
    codeBox.innerHTML = `
      <p><strong>Your Door Code:</strong></p>
      <p class="door-code" style="font-size: 1.8rem; font-weight: bold; letter-spacing: 4px;">${lockCode}</p>
    `;

    const existingInfoBlock = checkinSection.querySelector('.info-block');
    if (existingInfoBlock) {
      existingInfoBlock.insertAdjacentElement('afterend', codeBox);
    } else {
      checkinSection.querySelector('h2').insertAdjacentElement('afterend', codeBox);
    }
  }
}

// Update welcome with guest name
function updateWelcomeMessage(guestName) {
  const h1 = document.querySelector('.page-header h1');
  if (h1 && guestName && guestName !== 'Guest') {
    const firstName = guestName.split(' ')[0];
    h1.textContent = `Welcome, ${firstName}!`;
  }
}

// Initialize guest personalization
async function initGuestInfo() {
  const propertySlug = getPropertySlug();
  if (!propertySlug) return;

  console.log('Auto-detecting guest for property:', propertySlug);
  const guestInfo = await fetchGuestInfoByProperty(propertySlug);

  if (!guestInfo) {
    console.log('No current guest found - showing default experience');
    return;
  }

  console.log('Guest info loaded:', guestInfo);

  // SECURITY: Is the reservation still active?
  if (!isReservationActive(guestInfo.checkOut)) {
    console.log('Reservation has ended - blocking access');
    showStayEndedScreen(guestInfo.guestName);
    return;
  }

  // SECURITY: Has the reservation started yet?
  if (isBeforeCheckIn(guestInfo.checkIn)) {
    console.log('Reservation has not started yet');
    showTooEarlyScreen(guestInfo.guestName, guestInfo.checkIn);
    return;
  }

  // Reservation is active - show personalized experience
  if (guestInfo.guestName) {
    updateWelcomeMessage(guestInfo.guestName);
  }

  if (guestInfo.lockCode) {
    showDoorCode(guestInfo.lockCode);
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', initGuestInfo);
