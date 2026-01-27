const express = require("express");
const { sendEmail } = require("../utils/email");
const router = express.Router();

// POST /api/test/email
// Test email configuration by sending a standardized email to the requester
router.post("/email", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        console.log(`[Test] Attempting to send test email to ${email}...`);

        const subject = "Test Email from Campus Gigs";
        const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4F46E5;">Email System Operational</h2>
        <p>This is a test email triggered from the Campus Gigs backend.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p>If you see this, your SMTP configuration is correct.</p>
      </div>
    `;

        const result = await sendEmail(email, subject, html);

        if (result && result.success) {
            return res.json({
                success: true,
                message: "Email sent successfully",
                messageId: result.messageId
            });
        } else {
            console.error("[Test] Email send failed:", result ? result.error : "Unknown error");
            return res.status(500).json({
                success: false,
                error: "Failed to send email. Check server logs for details.",
                details: result ? result.error : undefined
            });
        }

    } catch (err) {
        console.error("[Test] Unexpected error:", err);
        res.status(500).json({ success: false, error: "Server error during test" });
    }
});

module.exports = router;
