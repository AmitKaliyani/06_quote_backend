export const resetEmailTemplate = (name, resetLink) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Hello ${name},</h2>

      <p>You requested to reset your password.</p>

      <a
        href="${resetLink}"
        style="
          display:inline-block;
          padding:12px 20px;
          background:#2563eb;
          color:#fff;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Reset Password
      </a>

      <p>This link will expire in 15 minutes.</p>

      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
};
