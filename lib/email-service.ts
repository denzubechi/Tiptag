import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  displayName: string,
  verificationCode: string
) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Verify your tiptag account",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #8b5cf6; text-align: center;">Welcome to tiptag!</h1>
        <p>Hi ${displayName},</p>
        <p>Thank you for creating your tiptag account. Please verify your email address by entering this code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background: #8b5cf6; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 8px; letter-spacing: 2px;">
            ${verificationCode}
          </span>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't create this account, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          tiptag - The easiest way for creators to receive tips
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(
  email: string,
  displayName: string,
  tipTag: string
) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Welcome to tiptag - Your creator journey starts now!",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #8b5cf6; text-align: center;">🎉 Welcome to tiptag!</h1>
        <p>Hi ${displayName},</p>
        <p>Your account is now verified and ready to go! Here's what you can do next:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #8b5cf6; margin-top: 0;">Your Tip Page</h3>
          <p>Your unique tip page is live at:</p>
          <a href="https://tiptag.com/tip/${tipTag}" style="color: #8b5cf6; font-weight: bold;">
            https://tiptag.com/tip/${tipTag}
          </a>
        </div>

        <h3 style="color: #8b5cf6;">Next Steps:</h3>
        <ul>
          <li>📝 Complete your profile with a bio and avatar</li>
          <li>🎯 Set up your first funding goal</li>
          <li>📱 Share your tip page on social media</li>
          <li>💰 Start receiving tips from your audience!</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://tiptag.com/dashboard" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>

        <p>Need help? Reply to this email or visit our help center.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          tiptag - The easiest way for creators to receive tips
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendTipNotificationEmail(
  email: string,
  displayName: string,
  amount: number,
  message: string,
  tipperName: string
) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `💰 You received a $${amount.toFixed(2)} tip!`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #10b981; text-align: center;">🎉 New Tip Received!</h1>
        <p>Hi ${displayName},</p>
        <p>Great news! You just received a tip:</p>
        
        <div style="background: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h2 style="color: #10b981; margin: 0 0 10px 0;">$${amount.toFixed(
            2
          )}</h2>
          <p style="margin: 0; color: #065f46;">From: ${tipperName}</p>
          ${
            message
              ? `<p style="margin: 10px 0 0 0; font-style: italic; color: #065f46;">"${message}"</p>`
              : ""
          }
        </div>

        <p>The tip has been added to your wallet balance and is ready to withdraw.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://tiptag.com/dashboard" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Dashboard
          </a>
        </div>

        <p>Keep creating amazing content!</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          tiptag - The easiest way for creators to receive tips
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
