require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [to],
      subject: subject,
      text: text,
      html: html,
    });
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

module.exports = { sendEmail };