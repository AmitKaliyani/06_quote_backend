import transporter from "../config/email.js";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `Quotes Hub <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.log("Error while sending Email ", error.message);
  }
};
