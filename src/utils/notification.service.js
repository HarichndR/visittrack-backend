const logger = require('./logger'); // Assuming a logger exists, if not I'll just use console

/**
 * Pseudo-Notification Service for Platform Events
 * Designed to be replaced with a real Mailer (Nodemailer/SendGrid) or SMS service.
 */
const sendOrganizerApprovalEmail = async (userEmail, businessName) => {
  const subject = `VisiTrack: Your Organizer Application for ${businessName} has been Approved!`;
  const body = `
    Hi there,

    Great news! Your organizer application for "${businessName}" has been reviewed and approved by the VisiTrack administration team.

    What happens next:
    1. Your account role has been upgraded to "ORGANIZER".
    2. You can now access the full Organizer Dashboard to create events, manage exhibitors, and track visitor registrations.
    3. Start by creating your first event at: /events/create

    Welcome to the VisiTrack ecosystem!

    Best regards,
    The VisiTrack Team
  `;

  console.log('------------------------------------------------------------');
  console.log(`[PSEUDO-EMAIL] TO: ${userEmail}`);
  console.log(`[PSEUDO-EMAIL] SUBJECT: ${subject}`);
  console.log(`[PSEUDO-EMAIL] CONTENT: ${body}`);
  console.log('------------------------------------------------------------');

  return true;
};

const sendVisitorBookingConfirmation = async (visitorEmail, eventName) => {
  const subject = `VisiTrack: Booking Confirmed for ${eventName}`;
  console.log(`[PSEUDO-EMAIL] TO: ${visitorEmail} | Booking Confirmed for ${eventName}`);
  return true;
};

module.exports = {
  sendOrganizerApprovalEmail,
  sendVisitorBookingConfirmation,
};
