import "server-only";
import nodemailer from "nodemailer";

function getMailConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass || !from || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM in .env.local.");
  }

  return { host, user, pass, from, port, secure: process.env.SMTP_SECURE === "true" || port === 465 };
}

export function assertMailConfigured() {
  getMailConfig();
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[character]!));

export async function sendPasswordResetOtp(email: string, name: string, otp: string) {
  const config = getMailConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Your SolarSaathi password reset code",
    text: `Hi ${name},\n\nYour password reset code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
    html: `<p>Hi ${escapeHtml(name)},</p><p>Your SolarSaathi password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${otp}</p><p>This code expires in 10 minutes. If you did not request this, ignore this email.</p>`,
  });
}

export function getPasswordResetSecret() {
  const secret = process.env.PASSWORD_RESET_SECRET || (process.env.NODE_ENV === "development" ? "solarsaathi-local-development-only-reset-secret" : undefined);
  if (!secret || secret.length < 32) {
    throw new Error("PASSWORD_RESET_SECRET must contain at least 32 characters.");
  }
  return secret;
}
