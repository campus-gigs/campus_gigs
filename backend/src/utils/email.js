const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, htmlContent) => {
  // Skip if no API key (dev mode safety)
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY is missing. Email skipped.');
    return { success: false, error: 'Missing API Key' };
  }

  try {
    console.log(`[Email] Sending to: ${to} via Resend...`);

    // Pro CSS-only Header (No broken images!)
    const headerHtml = `
      <div style="background-color: #FF5A1F; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 24px; font-weight: bold; letter-spacing: 1px;">
          Campus Gigs
        </h1>
      </div>
    `;

    const fullHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          ${headerHtml}
          <div style="padding: 30px; color: #333333; line-height: 1.6;">
            ${htmlContent}
          </div>
          <div style="background-color: #f1f1f1; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; color: #888888;">
            &copy; ${new Date().getFullYear()} Campus Gigs. All rights reserved.<br/>
            Built for students, by students.
          </div>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      html: fullHtml,
    });

    if (error) {
      console.error('[Email] Resend API Error:', error);
      return { success: false, error };
    }

    console.log('[Email] Sent successfully via Resend! ID:', data.id);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error('[Email] Unexpected Error:', err);
    return { success: false, error: err };
  }
};

// -----------------------------------------------------------------------------
// Auth Emails
// -----------------------------------------------------------------------------

const sendOtpEmail = async (email, otp) => {
  const subject = "Verify Your Campus Gigs Account";
  const html = `
    <h2 style="color: #333; margin-top: 0; font-size: 20px;">Verification Code</h2>
    <p>Welcome! Use the code below to verify your account and start exploring.</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF5A1F; background: #fff5f2; padding: 15px 30px; border-radius: 8px; border: 1px solid #ffe0d6;">${otp}</span>
    </div>
    <p style="color: #666; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
  `;
  return sendEmail(email, subject, html);
};

const sendWelcomeEmail = async (email, name) => {
  const subject = "Welcome to Campus Gigs! 🚀";
  const html = `
    <h2 style="color: #333; margin-top: 0;">Welcome, ${name}!</h2>
    <p>You're all set to start using <strong>Campus Gigs</strong>. Whether you're here to earn extra cash or get help with tasks, we're glad you're here.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://campusgigs.site/dashboard" style="background-color: #FF5A1F; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
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
    <h2 style="color: #333; margin-top: 0;">Job Accepted! 🤝</h2>
    <p>Good news! <strong>${workerName}</strong> has accepted your job request:</p>
    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #FF5A1F; margin: 20px 0;">
      <strong>${jobTitle}</strong>
    </div>
    <p>Log in to your dashboard to chat with them and manage the job.</p>
    <div style="text-align: center; margin-top: 25px;">
      <a href="https://campusgigs.site/dashboard" style="color: #FF5A1F; text-decoration: none; font-weight: bold;">View Job Details &rarr;</a>
    </div>
  `;
  return sendEmail(email, subject, html);
};

const sendJobCompletedEmail = async (email, jobTitle, workerName) => {
  const subject = `Job Completed: ${jobTitle}`;
  const html = `
    <h2 style="color: #10B981; margin-top: 0;">Job Done! ✅</h2>
    <p><strong>${workerName}</strong> has marked your job as completed:</p>
    <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #10B981; margin: 20px 0;">
      <strong>${jobTitle}</strong>
    </div>
    <p>Please review the work and release the payment if everything looks good.</p>
    <div style="text-align: center; margin-top: 25px;">
      <a href="https://campusgigs.site/dashboard" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review & Pay</a>
    </div>
  `;
  return sendEmail(email, subject, html);
};

// -----------------------------------------------------------------------------
// Chat Emails
// -----------------------------------------------------------------------------

const sendNewMessageEmail = async (email, senderName, content) => {
  const subject = `New Message from ${senderName}`;
  const html = `
    <h3 style="color: #333; margin-top: 0;">New Message 💬</h3>
    <p><strong>${senderName}</strong> sent you:</p>
    <blockquote style="border-left: 4px solid #FF5A1F; padding-left: 15px; color: #555; font-style: italic; margin: 20px 0; background: #fff5f2; padding: 15px;">
      "${content}"
    </blockquote>
    <div style="margin-top: 30px; text-align: center;">
      <a href="https://campusgigs.site/dashboard/chat" style="background-color: #FF5A1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reply Now</a>
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
