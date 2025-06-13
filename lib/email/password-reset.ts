import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail({
  email,
  token
}: {
  email: string;
  token: string;
}) {
  const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;

  const subject = 'Reset your password';
  const html = `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password. Click the link below to set a new one:</p>
    <p><a href="${resetUrl}">Click here to reset your password</a></p>
    <p>This link will expire in 30 minutes.</p>
  `;

  await resend.emails.send({
    from: 'no-reply@mjeti360.com',
    to: email,
    subject,
    html
  });
}
