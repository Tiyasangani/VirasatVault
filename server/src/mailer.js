import nodemailer from 'nodemailer'
import { config } from './config.js'

// Sends email through any SMTP provider (Brevo, Gmail app password, Resend SMTP, Mailgun...).
const transport = config.mailEnabled
  ? nodemailer.createTransport({ host: config.smtp.host, port: config.smtp.port, secure: config.smtp.secure, auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined })
  : null

export async function sendMail({ to, subject, text }) {
  if (!transport) return false
  await transport.sendMail({ from: config.smtp.from, to, subject, text })
  return true
}
