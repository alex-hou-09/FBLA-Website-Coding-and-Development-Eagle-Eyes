const getClaimApprovedEmail = (userName, itemName, submissionType) => {
  let subject, text, html;

  if (submissionType === "item-claim") {
    subject = "Your Item Claim Has Been Approved";
    text = `Hi ${userName},\n\nGood news! Your claim for "${itemName}" has been approved.\n\nYou can now collect your item from the Lost & Found office.\n\nBest regards,\nLost & Found Team`;
    html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: black; font-weight: 400; font-size: 18px; background-color: #f5f5f5; padding: 5%; border-radius: 12px;">
        <h2 style="font-size: 32px;">Claim Approved</h2>
        <p>Hi ${userName},</p>
        <p>Good news! Your claim for "${itemName}" has been approved.</p>
        <p>You can now collect your item from the Lost & Found office.</p>
        <p style="margin-top: 30px;">
          Best regards,<br>
          Lost & Found Team
        </p>
      </div>
    `;
  } else if (submissionType === "found-report") {
    subject = "Your Found Report Has Been Approved";
    text = `Hi ${userName},\n\nYour found report for "${itemName}" has been approved and added to our database.\n\nThank you for your honesty!\n\nBest regards,\nLost & Found Team`;
    html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: black; font-weight: 400; font-size: 18px; background-color: #f5f5f5; padding: 5%; border-radius: 12px;">
        <h2 style="font-size: 32px;">Found Report Approved</h2>
        <p>Hi ${userName},</p>
        <p>Your found report for "${itemName}" has been approved and added to our database.</p>
        <p>Thank you for your honesty!</p>
        <p style="margin-top: 30px;">
          Best regards,<br>
          Lost & Found Team
        </p>
      </div>
    `;
  } else if (submissionType === "lost-report") {
    subject = "Your Lost Report Has Been Approved";
    text = `Hi ${userName},\n\nYour lost report for "${itemName}" has been approved.\n\nWe'll notify you if a matching item is found.\n\nBest regards,\nLost & Found Team`;
    html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: black; font-weight: 400; font-size: 18px; background-color: #f5f5f5; padding: 5%; border-radius: 12px;">
        <h2 style="font-size: 32px;">Lost Report Approved</h2>
        <p>Hi ${userName},</p>
        <p>Your lost report for "${itemName}" has been approved.</p>
        <p>We'll notify you if a matching item is found.</p>
        <p style="margin-top: 30px;">
          Best regards,<br>
          Lost & Found Team
        </p>
      </div>
    `;
  }

  return { subject, text, html };
};

const getClaimDeniedEmail = (userName, itemName, reason) => ({
  subject: "Update on Your Submission",
  text: `Hi ${userName},\n\nYour submission for "${itemName}" was not approved.\n\nIf you have questions, please contact us.\n\nBest regards,\nLost & Found Team`,
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: black; font-weight: 400; font-size: 18px; background-color: #f5f5f5; padding: 5%; border-radius: 12px;">
      <h2 style="font-size: 32px;">Submission Status Update</h2>
      <p>Hi ${userName},</p>
      <p>Your submission for "${itemName}" was not approved.</p>
      <p>If you have questions, please contact us.</p>
      <p style="margin-top: 30px;">
        Best regards,<br>
        Lost & Found Team
      </p>
    </div>
  `,
});

const getContactResponseEmail = (userName, originalMessage, response) => ({
  subject: "Response to Your Message",
  text: `Hi ${userName},\n\nWe've responded to your message:\n\n"${originalMessage}"\n\nOur response:\n${response}\n\nBest regards,\nLost & Found Team`,
  html: `
    <div style="font-family: Montserrat, sans-serif; max-width: 600px; margin: 0 auto; color: black; font-weight: 400;">
      <h2>Response to Your Message</h2>
      <p>Hi ${userName},</p>
      <p>Your message:</p>
      <blockquote style="border-left: 3px solid #ddd; padding-left: 15px; color: black;">
        ${originalMessage}
      </blockquote>
      <p>Our response:</p>
      <p>${response}</p>
      <p style="margin-top: 30px;">
        Best regards,<br>
        Lost & Found Team
      </p>
    </div>
  `,
});

const getItemClaimedEmail = (userName, itemName, claimantEmail) => ({
  subject: "Your Item Has Been Claimed",
  text: `Hi ${userName},\n\nGreat news! The item you turned in "${itemName}" has been claimed by ${claimantEmail}.\n\nThank you for your honesty!\n\nBest regards,\nLost & Found Team`,
  html: `
    <div style="font-family: Montserrat, sans-serif; max-width: 600px; margin: 0 auto; color: black; font-weight: 400;">
      <h2>Item Claimed</h2>
      <p>Hi ${userName},</p>
      <p>Great news! The item you turned in "${itemName}" has been claimed by ${claimantEmail}.</p>
      <p>Thank you for your honesty!</p>
      <p style="margin-top: 30px;">
        Best regards,<br>
        Lost & Found Team
      </p>
    </div>
  `,
});

module.exports = {
  getClaimApprovedEmail,
  getClaimDeniedEmail,
  getContactResponseEmail,
  getItemClaimedEmail,
};