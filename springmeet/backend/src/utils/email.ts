import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'aittezazahmad@gmail.com',
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"SpringMeet 🌸" <${process.env.SMTP_USER || 'aittezazahmad@gmail.com'}>`;
const APP_URL = process.env.FRONTEND_URL || 'https://springmeet.app';

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM, to: email,
    subject: '🌸 Verify your SpringMeet account',
    html: emailTemplate('Verify Your Email', name,
      `<p>Welcome to SpringMeet! Click the button below to verify your email and start meeting amazing people from around the world.</p>`,
      link, 'Verify Email'),
  });
  logger.info(`Verification email sent to ${email}`);
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM, to: email,
    subject: '🔐 Reset your SpringMeet password',
    html: emailTemplate('Reset Your Password', name,
      `<p>We received a request to reset your password. Click the button below. This link expires in 1 hour.</p>`,
      link, 'Reset Password'),
  });
}

export async function sendMatchAcceptedEmail(email: string, name: string, matchName: string) {
  await transporter.sendMail({
    from: FROM, to: email,
    subject: `💌 ${matchName} accepted your connection on SpringMeet!`,
    html: emailTemplate('New Match!', name,
      `<p><strong>${matchName}</strong> has accepted your conversation request! Your chat is now saved in your inbox. Head back to continue the connection. 🌸</p>`,
      `${APP_URL}/inbox`, 'Go to Inbox'),
  });
}

export async function sendWarningEmail(email: string, name: string, reason: string) {
  await transporter.sendMail({
    from: FROM, to: email,
    subject: '⚠️ Account warning - SpringMeet',
    html: emailTemplate('Account Warning', name,
      `<p>Your account has received a safety warning for: <strong>${reason}</strong>.</p><p>Continued violations may result in account suspension. Please review our community guidelines.</p>`,
      `${APP_URL}/safety`, 'View Safety Guidelines'),
  });
}

function emailTemplate(title: string, name: string, body: string, ctaUrl: string, ctaText: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>
    body{font-family:'DM Sans',Arial,sans-serif;background:#080C17;color:#F0F4FF;margin:0;padding:0}
    .wrap{max-width:560px;margin:0 auto;padding:40px 20px}
    .card{background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:40px}
    .logo{text-align:center;font-size:28px;font-weight:700;margin-bottom:32px;color:#FF6B9D}
    h1{font-size:24px;margin-bottom:16px;color:#F0F4FF}
    p{color:#8B95A9;line-height:1.7;margin-bottom:16px}
    .btn{display:inline-block;background:linear-gradient(135deg,#FF6B9D,#C084FC);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;margin:20px 0}
    .footer{text-align:center;margin-top:32px;font-size:12px;color:#6B7485}
    .footer a{color:#FF6B9D}
  </style></head><body><div class="wrap"><div class="card">
    <div class="logo">🌸 SpringMeet</div>
    <h1>${title}</h1>
    <p>Hi ${name},</p>${body}
    <div style="text-align:center"><a href="${ctaUrl}" class="btn">${ctaText}</a></div>
    <p style="font-size:12px;text-align:center">If you didn't request this, you can safely ignore this email.</p>
  </div><div class="footer">
    <p>SpringMeet — Make spring all over the world 🌸</p>
    <p>Questions? <a href="mailto:aittezazahmad@gmail.com">aittezazahmad@gmail.com</a> · <a href="tel:+923419098201">+92 341 909 8201</a></p>
    <p>Built by Aittezaz Ahmad</p>
  </div></div></body></html>`;
}
