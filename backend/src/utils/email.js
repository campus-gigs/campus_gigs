const { Resend } = require('resend');

// Initialize Resend with the API Key (stored in EMAIL_PASS)
// We use EMAIL_PASS because that's what the user already set in Render.
const resend = new Resend(process.env.EMAIL_PASS);

const sendEmail = async (to, subject, html) => {
  try {
    const fromName = process.env.EMAIL_USER === 'resend' ? 'Campus Gigs' : 'Campus Gigs Admin';
    // Use the default 'onboarding' domain provided by Resend for free tier if no custom domain
    // Or allow customization if they verified one. 
    // Safest default for new accounts is 'onboarding@resend.dev'
    const fromEmail = 'onboarding@resend.dev';

    console.log(`[Email] Sending to: ${to} via Resend HTTP API...`);

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('[Email] Resend API Error:', error);
      return false;
    }

    console.log('[Email] Sent successfully via Resend SDK! ID:', data.id);
    return true;
  } catch (error) {
    console.error('[Email] Unexpected Error:', error);
    return false;
  }
};

module.exports = sendEmail;
