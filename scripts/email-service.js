// Email Service Configuration for tiptag
// This script sets up the Gmail SMTP service for sending transactional emails

import nodemailer from "nodemailer";
import NodeCache from "node-cache";

// Initialize cache for temporary tokens (OTPs, verification codes)
// TTL: 15 minutes for verification codes, 5 minutes for OTPs
const tokenCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

// Gmail SMTP Configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Email Templates
const emailTemplates = {
  welcome: (displayName, tipTag) => ({
    subject: "Welcome to tiptag! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 28px; margin: 0;">Welcome to tiptag!</h1>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Hi ${displayName},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Welcome to tiptag! We're excited to have you join our community of creators who are 
          building meaningful connections with their audience through support and appreciation.
        </p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Your Tip Tag is Ready!</h3>
          <p style="margin: 10px 0;">Your unique tip page: <strong>tiptag.com/tip/${tipTag}</strong></p>
          <p style="margin: 10px 0; color: #6b7280;">Share this link with your audience to start receiving tips!</p>
        </div>
        
        <h3 style="color: #374151;">What's Next?</h3>
        <ul style="font-size: 16px; line-height: 1.6; color: #4b5563;">
          <li>Complete your profile with a bio and profile picture</li>
          <li>Add links to your work, portfolio, and social media</li>
          <li>Connect your Base Account for seamless payouts</li>
          <li>Share your tip tag with your audience</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://tiptag.com/dashboard" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Complete Your Profile
          </a>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">
          If you have any questions or need help getting started, don't hesitate to reach out to our support team.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Happy creating!<br>
          The tiptag Team
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          This email was sent by tiptag. If you didn't create this account, please ignore this email.
        </p>
      </div>
    `,
  }),

  setupGuide: (displayName, tipTag) => ({
    subject: "Complete Your tiptag Setup - Quick Guide",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7c3aed; text-align: center;">Complete Your Setup</h1>
        
        <p style="font-size: 16px; line-height: 1.6;">Hi ${displayName},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          You're just a few steps away from having a complete tiptag profile! Here's your quick setup guide:
        </p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0;">
          <h3 style="color: #0c4a6e; margin-top: 0;">🎯 Step 1: Complete Your Profile</h3>
          <ul style="color: #0c4a6e; margin: 10px 0;">
            <li>Add a profile picture</li>
            <li>Write a compelling bio</li>
            <li>Add links to your work and social media</li>
          </ul>
        </div>
        
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0;">
          <h3 style="color: #14532d; margin-top: 0;">💳 Step 2: Connect Base Pay</h3>
          <p style="color: #14532d; margin: 10px 0;">
            Link your Base Account to receive payouts directly to your wallet.
          </p>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">📢 Step 3: Share Your Tip Tag</h3>
          <p style="color: #92400e; margin: 10px 0;">
            Your tip page: <strong>tiptag.com/tip/${tipTag}</strong>
          </p>
          <p style="color: #92400e; margin: 10px 0;">
            Share this link in your bio, videos, posts, and anywhere your audience can find it!
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://tiptag.com/dashboard" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 10px;">
            Go to Dashboard
          </a>
          <a href="https://tiptag.com/tip/${tipTag}" 
             style="background: #e5e7eb; color: #374151; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Preview Your Page
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          Need help? Reply to this email or visit our help center.
        </p>
      </div>
    `,
  }),

  tipReceived: (creatorName, amount, message, tipperName) => ({
    subject: `New Tip Received - $${amount} 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; font-size: 28px; margin: 0;">You received a new tip! 🎉</h1>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Hi ${creatorName},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Great news! You just received a tip of <strong style="color: #059669; font-size: 18px;">$${amount}</strong>.
        </p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #14532d; margin-top: 0;">Tip Details</h3>
          <p style="margin: 8px 0;"><strong>Amount:</strong> $${amount}</p>
          <p style="margin: 8px 0;"><strong>From:</strong> ${tipperName}</p>
          ${
            message
              ? `<p style="margin: 8px 0;"><strong>Message:</strong></p><p style="font-style: italic; color: #374151; background: white; padding: 10px; border-radius: 4px;">"${message}"</p>`
              : ""
          }
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Your supporters appreciate the value you create. Keep up the amazing work!
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://tiptag.com/dashboard" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Dashboard
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          This notification was sent by tiptag. You can manage your notification preferences in your dashboard.
        </p>
      </div>
    `,
  }),

  emailVerification: (displayName, verificationCode) => ({
    subject: "Verify Your tiptag Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7c3aed; text-align: center;">Verify Your Email</h1>
        
        <p style="font-size: 16px; line-height: 1.6;">Hi ${displayName},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          To complete your tiptag registration, please verify your email address using the code below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #f3f4f6; border: 2px dashed #9ca3af; border-radius: 8px; padding: 20px; display: inline-block;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Your verification code:</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #7c3aed; letter-spacing: 4px;">${verificationCode}</p>
          </div>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #dc2626;">
          <strong>Important:</strong> This code will expire in 15 minutes.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          If you didn't create a tiptag account, please ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          This email was sent by tiptag. If you have any questions, please contact our support team.
        </p>
      </div>
    `,
  }),

  passwordReset: (displayName, resetCode) => ({
    subject: "Reset Your tiptag Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7c3aed; text-align: center;">Reset Your Password</h1>
        
        <p style="font-size: 16px; line-height: 1.6;">Hi ${displayName},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          You requested to reset your tiptag password. Use the code below to continue:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px; padding: 20px; display: inline-block;">
            <p style="margin: 0; font-size: 14px; color: #991b1b;">Your reset code:</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 4px;">${resetCode}</p>
          </div>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #dc2626;">
          <strong>Important:</strong> This code will expire in 15 minutes.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          This email was sent by tiptag. If you have any questions, please contact our support team.
        </p>
      </div>
    `,
  }),
};

// Email sending functions
export const sendWelcomeEmail = async (email, displayName, tipTag) => {
  const transporter = createTransporter();
  const template = emailTemplates.welcome(displayName, tipTag);

  const mailOptions = {
    from: `"tiptag" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendSetupGuideEmail = async (email, displayName, tipTag) => {
  const transporter = createTransporter();
  const template = emailTemplates.setupGuide(displayName, tipTag);

  const mailOptions = {
    from: `"tiptag" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendTipNotificationEmail = async (
  email,
  creatorName,
  amount,
  message,
  tipperName
) => {
  const transporter = createTransporter();
  const template = emailTemplates.tipReceived(
    creatorName,
    amount,
    message,
    tipperName
  );

  const mailOptions = {
    from: `"tiptag" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (
  email,
  displayName,
  verificationCode
) => {
  const transporter = createTransporter();
  const template = emailTemplates.emailVerification(
    displayName,
    verificationCode
  );

  // Store verification code in cache
  tokenCache.set(`verify_${email}`, verificationCode, 900); // 15 minutes

  const mailOptions = {
    from: `"tiptag" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email, displayName, resetCode) => {
  const transporter = createTransporter();
  const template = emailTemplates.passwordReset(displayName, resetCode);

  // Store reset code in cache
  tokenCache.set(`reset_${email}`, resetCode, 900); // 15 minutes

  const mailOptions = {
    from: `"tiptag" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html,
  };

  return await transporter.sendMail(mailOptions);
};

// Token verification functions
export const verifyEmailCode = (email, code) => {
  const storedCode = tokenCache.get(`verify_${email}`);
  if (storedCode && storedCode === code) {
    tokenCache.del(`verify_${email}`); // Remove code after successful verification
    return true;
  }
  return false;
};

export const verifyResetCode = (email, code) => {
  const storedCode = tokenCache.get(`reset_${email}`);
  if (storedCode && storedCode === code) {
    tokenCache.del(`reset_${email}`); // Remove code after successful verification
    return true;
  }
  return false;
};

// Scheduled email functions (for engagement)
export const scheduleEngagementEmails = () => {
  // This would be implemented with a job scheduler like node-cron
  // Example: Send setup reminder after 24 hours if profile incomplete
  console.log("Engagement email scheduler initialized");
};

console.log("Email service initialized with Gmail SMTP");
