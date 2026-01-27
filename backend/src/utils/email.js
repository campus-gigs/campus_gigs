const { Resend } = require('resend');

const resend = new Resend(process.env.EMAIL_PASS);

// This matches your deployed BACKEND URL where logo.svg is now served
const LOGO_URL = "https://campus-gigs.onrender.com/logo.svg";

// Common style for the logo header
const logoHeader = `
  <div style="margin-bottom: 20px; text-align: center;">
    <img src="${LOGO_URL}" alt="Campus Gigs Logo" width="50" height="50" style="background-color: #FF5A1F; padding: 8px; border-radius: 8px;" />
    <h1 style="color: #FF5A1F; font-family: sans-serif; font-size: 24px; margin-top: 10px;">Campus Gigs</h1>
  </div>
`;

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const fromName = process.env.EMAIL_USER === 'resend' ? 'Campus Gigs' : 'Campus Gigs Admin';
    const fromEmail = 'noreply@campusgigs.site';

    console.log(`[Email] Sending to: ${to} via Resend HTTP API...`);

    // Wrap content in a nice container with the logo
    const fullHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${logoHeader}
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
          ${htmlContent}
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Campus Gigs. All rights reserved.
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: fullHtml,
    });

    if (error) {
      console.error('[Email] Resend API Error:', error);
      return { success: false, error };
    }

    console.log('[Email] Sent successfully via Resend SDK! ID:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('[Email] Unexpected Error:', error);
    return { success: false, error };
  }
};

// -----------------------------------------------------------------------------
// Auth Emails
// -----------------------------------------------------------------------------

const sendOtpEmail = async (email, otp) => {
  const subject = "Verify Your Campus Gigs Account";
  const html = `
    <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
    <p>Welcome! Please enter the following code to verify your account:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF5A1F; background: #fff5f2; padding: 10px 20px; border-radius: 8px;">${otp}</span>
    </div>
    <p>This code expires in 10 minutes.</p>
  `;
  return sendEmail(email, subject, html);
};

const sendWelcomeEmail = async (email, name) => {
  const subject = "Welcome to Campus Gigs!";
  const html = `
    <h2 style="color: #333; margin-top: 0;">Welcome, ${name}! 🎉</h2>
    <p>Thanks for joining the platform. We're excited to have you on board.</p>
    <p>You can now:</p>
    <ul>
      <li>Browse available gigs</li>
      <li>Post jobs for others</li>
      <li>Connect with students</li>
    </ul>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://campus-gigs.site/dashboard" style="background-color: #FF5A1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
    </div>
  `;
  return sendEmail(email, subject, html);
};

// -----------------------------------------------------------------------------
// Job Emails
// -----------------------------------------------------------------------------

const sendJobAcceptedEmail = async (email, jobTitle, workerName) => {
  const subject = `Job Accepted: ${jobTitle}`;
  const html = `
    <h2 style="color: #333; margin-top: 0;">Good News!</h2>
    <p>Your job <strong>"${jobTitle}"</strong> has been accepted by <strong>${workerName}</strong>.</p>
    <p>Check your dashboard to view their details and start specific instructions.</p>
  `;
  return sendEmail(email, subject, html);
};

const sendJobCompletedEmail = async (email, jobTitle, workerName) => {
  const subject = `Job Completed: ${jobTitle}`;
  const html = `
    <h2 style="color: #10B981; margin-top: 0;">Job Done!</h2>
    <p><strong>${workerName}</strong> has marked your job <strong>"${jobTitle}"</strong> as completed.</p>
    <p>Please review the work.</p>
  `;
  return sendEmail(email, subject, html);
};

// -----------------------------------------------------------------------------
// Chat Emails
// -----------------------------------------------------------------------------

const sendNewMessageEmail = async (email, senderName, content) => {
  const subject = `New Message from ${senderName}`;
  const html = `
    <h3 style="color: #333; margin-top: 0;">New Message</h3>
    <p><strong>${senderName}</strong> sent you:</p>
    <blockquote style="border-left: 4px solid #FF5A1F; padding-left: 15px; color: #555; font-style: italic;">
      "${content}"
    </blockquote>
    <div style="margin-top: 20px;">
      <a href="https://campus-gigs.site/dashboard/chat" style="color: #FF5A1F; text-decoration: none; font-weight: bold;">Reply on Campus Gigs &rarr;</a>
    </div>
  `;
  return sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendWelcomeEmail,
  sendJobAcceptedEmail,
  sendJobCompletedEmail,
  sendNewMessageEmail
};
