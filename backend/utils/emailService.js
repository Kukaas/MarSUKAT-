import nodemailer from "nodemailer";
import dotenv from "dotenv";
// import MARSU_LOGO from "../assets/msc_logo.jpg";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

// Testing the transporter
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP Error:", error);
  } else {
    console.log("Ready for sending emails");
  }
});

export const sendVerificationEmail = async ({ _id, email }, uniqueString) => {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    const mailOptions = {
      from: {
        name: "MarSUKAT",
        address: process.env.AUTH_EMAIL,
      },
      to: email,
      subject: "Verify Your Email",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" style="width: 100%; border: none; margin: 0; padding: 0;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 94%; max-width: 600px; border: none; margin: 0; padding: 0; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);">
                    <!-- Header with Maroon Background -->
                    <tr>
                      <td style="background-color: #800000; padding: 20px 30px; border-radius: 8px 8px 0 0;">
                        <div style="text-align: center;">
                          <h1 style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0; font-family: Times New Roman, serif;">Republic of the Philippines</h1>
                          <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 8px 0; font-family: Times New Roman, serif;">Marinduque State University</h1>
                          <p style="color: #ffffff; font-size: 14px; margin: 0; font-style: italic;">Tanza, Boac, Marinduque</p>
                        </div>
                      </td>
                    </tr>
                    <!-- Logo Section -->
                    <tr>
                      <td style="padding: 30px 30px 20px; text-align: center;">
                        <img src="https://www.marinduque.edu.ph/wp-content/uploads/2023/03/MSU-Logo-1.png" alt="MSU Logo" style="width: 120px; height: 120px; margin: 0 auto;" />
                      </td>
                    </tr>
                    <!-- Content Section -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 16px;">Verify your email address to complete the signup process.</p>
                          <p style="color: #666666; font-size: 14px; margin: 0 0 24px;">This link expires in 6 hours.</p>
                        </div>
                        <div style="text-align: center; margin-bottom: 30px;">
                          <a href="${backendUrl}/api/v1/auth/verify/${_id}/${uniqueString}"
                             style="display: inline-block; background-color: #800000; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 12px 32px; border-radius: 4px; transition: all 0.2s;">
                            Verify Email
                          </a>
                        </div>
                        <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 30px;">
                          <p style="color: #666666; font-size: 14px; margin: 0;">
                            If you did not request this, please ignore this message.
                          </p>
                        </div>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                        <p style="color: #666666; font-size: 12px; margin: 0;">
                          All rights reserved, MarSUKAT 2024
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

// Send OTP email template
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: {
        name: "MarSUKAT",
        address: process.env.AUTH_EMAIL,
      },
      to: email,
      subject: "Password Reset OTP",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" style="width: 100%; border: none; margin: 0; padding: 0;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 94%; max-width: 600px; border: none; margin: 0; padding: 0; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);">
                    <!-- Header with Maroon Background -->
                    <tr>
                      <td style="background-color: #800000; padding: 20px 30px; border-radius: 8px 8px 0 0;">
                        <div style="text-align: center;">
                          <h1 style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0; font-family: Times New Roman, serif;">Republic of the Philippines</h1>
                          <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 8px 0; font-family: Times New Roman, serif;">Marinduque State University</h1>
                          <p style="color: #ffffff; font-size: 14px; margin: 0; font-style: italic;">Tanza, Boac, Marinduque</p>
                        </div>
                      </td>
                    </tr>
                    <!-- Logo Section -->
                    <tr>
                      <td style="padding: 30px 30px 20px; text-align: center;">
                        <img src="https://www.marinduque.edu.ph/wp-content/uploads/2023/03/MSU-Logo-1.png" alt="MSU Logo" style="width: 120px; height: 120px; margin: 0 auto;" />
                      </td>
                    </tr>
                    <!-- Content Section -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <h2 style="color: #333333; font-size: 24px; margin: 0 0 16px;">Password Reset Request</h2>
                          <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 16px;">Your OTP for password reset is:</p>
                          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #800000;">${otp}</span>
                          </div>
                          <p style="color: #666666; font-size: 14px; margin: 16px 0 0;">This OTP will expire in 5 minutes.</p>
                        </div>
                        <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 30px;">
                          <p style="color: #666666; font-size: 14px; margin: 0;">
                            If you did not request this password reset, please ignore this message.
                          </p>
                        </div>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                        <p style="color: #666666; font-size: 12px; margin: 0;">
                          All rights reserved, MarSUKAT 2024
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

export { transporter };
