// backend/utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "premsatarekar@gmail.com", //
      pass: "zkbchfotoxazuhxb", //
    },
  });

  const mailOptions = {
    from: '"Jewellery Management" <premsatarekar@gmail.com>',
    to,
    subject: "🔐 OTP for Password Reset",
    text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 30px;">
        <div style="max-width: 500px; margin: auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #764ba2; text-align: center;">🔐 Jewellery Management System</h2>
          <p style="font-size: 16px;">Hello Admin,</p>
          <p style="font-size: 15px;">Here is your OTP to reset your password:</p>
          <p style="font-size: 28px; font-weight: bold; color: #333; text-align: center;">${otp}</p>
          <p style="font-size: 14px; color: #555;">This OTP is valid for 10 minutes.</p>
          <hr style="margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">If you didn’t request this password reset, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
