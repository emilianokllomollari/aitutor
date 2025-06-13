import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTeamInviteEmail({
  email,
  teamName,
  role,
  inviteId
}: {
  email: string;
  teamName: string;
  role: string;
  inviteId: number;
}) {
  const signupUrl = `${process.env.BASE_URL}/sign-up?inviteId=${inviteId}&email=${encodeURIComponent(email)}`;

  const subject = `You're invited to join ${teamName}`;
  const html = `
    <h1>You've been invited!</h1>
    <p>You were invited to join the <strong>${teamName}</strong> team as a <strong>${role}</strong>.</p>
    <p><a href="${signupUrl}">Click here to join the team</a></p>
  `;

  await resend.emails.send({
    from: 'no-reply@mjeti360.com',
    to: email,
    subject,
    html
  });
}
