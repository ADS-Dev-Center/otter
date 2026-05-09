export type InviteEmailProps = {
  inviterName: string;
  divisionName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
};

export function inviteEmailHtml({
  inviterName,
  divisionName,
  role,
  inviteUrl,
  expiresAt,
}: InviteEmailProps): string {
  return `
    <p>Hi,</p>
    <p><strong>${inviterName}</strong> has invited you to join the
    <strong>${divisionName}</strong> division on Otter as a <strong>${role}</strong>.</p>
    <p><a href="${inviteUrl}">Accept invitation</a></p>
    <p>This link expires on ${expiresAt.toLocaleDateString()}.</p>
    <p>If you didn't expect this, you can ignore this email.</p>
  `;
}
