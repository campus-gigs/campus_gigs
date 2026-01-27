const { Resend } = require('resend');

const resend = new Resend(process.env.EMAIL_PASS);

const sendEmail = async (to, subject, html) => {
  try {
    const fromName = process.env.EMAIL_USER === 'resend' ? 'Campus Gigs' : 'Campus Gigs Admin';

    // NOW USING YOUR VERIFIED DOMAIN!
    // This allows sending to ANY email address (students, etc.)
    const fromEmail = 'noreply@campusgigs.site';

    console.log(`[Email] Sending to: ${to} via Resend HTTP API...`);

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
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
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4F46E5;">Campus Gigs Verification</h2>
      <p>Your OTP code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

const sendWelcomeEmail = async (email, name) => {
  const subject = "Welcome to Campus Gigs!";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4F46E5;">Welcome, ${name}! 🎉</h2>
      <p>Thanks for joining Campus Gigs. We're excited to have you.</p>
      <p>You can now look for gigs or post your own.</p>
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
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4F46E5;">Good News!</h2>
      <p>Your job <strong>"${jobTitle}"</strong> has been accepted by <strong>${workerName}</strong>.</p>
      <p>You can verify their details in your dashboard.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

const sendJobCompletedEmail = async (email, jobTitle, workerName) => {
  const subject = `Job Completed: ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #10B981;">Job Done!</h2>
      <p><strong>${workerName}</strong> has marked your job <strong>"${jobTitle}"</strong> as completed.</p>
      <p>Please review the work and release payment if everything looks good.</p>
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
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h3 style="color: #4F46E5;">New Message</h3>
      <p><strong>${senderName}</strong> sent you a message:</p>
      <blockquote style="border-left: 4px solid #ddd; padding-left: 10px; color: #555;">
        ${content}
      </blockquote>
      <p>Log in to Campus Gigs to reply.</p>
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
