import transporter from "../config/email.js";
import { env } from "../config/env.js";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `Quotes Hub <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.log("Error while sending Email ", error.message);
  }
};
