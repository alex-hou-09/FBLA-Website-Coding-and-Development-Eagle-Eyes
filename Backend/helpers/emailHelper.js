require("dotenv").config();
const {Resend} = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email via Resend.
 * @param {object} opts
 * @param {string} opts.to       - Recipient address
 * @param {string} opts.subject  - Email subject
 * @param {string} [opts.text]   - Plain-text fallback
 * @param {string} [opts.html]   - HTML body
 */
const sendEmail = async ({to, subject, text, html}) => {
  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [to],
      subject,
      text,
      html,
    });
    console.log(`✓ Email sent to ${to}:`, data);
    return data;
  } catch (error) {
    console.error("✗ Failed to send email:", error);
  }
};

module.exports = {sendEmail};
