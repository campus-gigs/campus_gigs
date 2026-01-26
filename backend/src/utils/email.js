const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not found. Skipping email.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Campus Gigs" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendWelcomeEmail = async (to, name) => {
  const subject = "Welcome to Campus Gigs!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome, ${name}!</h2>
      <p>Thanks for joining Campus Gigs. We're excited to have you on board.</p>
      <p>Start exploring jobs or post one today!</p>
      <p>Best regards,<br>The Campus Gigs Team</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

const sendJobAcceptedEmail = async (to, jobTitle, workerName) => {
  const subject = "Your Job Has Been Accepted!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Good News!</h2>
      <p>Your job "<strong>${jobTitle}</strong>" has been accepted by <strong>${workerName}</strong>.</p>
      <p>You can now chat with them to coordinate the details.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
    </div>
  `;
  await sendEmail(to, subject, html);
};

const sendJobCompletedEmail = async (to, jobTitle, workerName) => {
  const subject = "Job Completed!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Job Completed</h2>
      <p><strong>${workerName}</strong> has marked "<strong>${jobTitle}</strong>" as completed.</p>
      <p>Please review their work and leave a rating.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Now</a>
    </div>
  `;
  await sendEmail(to, subject, html);
};

const sendNewMessageEmail = async (to, senderName, messagePreview) => {
  const subject = `New Message from ${senderName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h3 style="color: #4F46E5;">New Message</h3>
      <p><strong>${senderName}</strong> sent you a message:</p>
      <blockquote style="border-left: 4px solid #E5E7EB; padding-left: 10px; color: #4B5563;">
        ${messagePreview}
      </blockquote>
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/chat" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reply Now</a>
    </div>
  `;
  await sendEmail(to, subject, html);
};

const sendOtpEmail = async (to, otp) => {
  const subject = "Verify your email";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Verify your email</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

module.exports = {
  sendWelcomeEmail,
  sendJobAcceptedEmail,
  sendJobCompletedEmail,
  sendNewMessageEmail,
  sendOtpEmail,
};
