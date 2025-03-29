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

export const sendVerificationEmail = async (
  { _id, email, name, role, password },
  uniqueString
) => {
  try {
    const backendUrl = process.env.NODE_ENV === "production" ? process.env.BACKEND_URL : "http://localhost:3000";
    const mailOptions = {
      from: {
        name: "MarSUKAT",
        address: process.env.AUTH_EMAIL,
      },
      to: email,
      subject:
        role === "JobOrder" || role === "SuperAdmin" || role === "BAO"
          ? "Verify Your Email and Account Information"
          : "Verify Your Email",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table role="presentation" style="width: 100%; border: none; margin: 0; padding: 0;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 94%; max-width: 600px; border: none; margin: 0; padding: 0;">
                    <!-- Header with Maroon Background -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #800000 0%, #b30000 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                        <div style="text-align: center;">
                          <h1 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Republic of the Philippines</h1>
                          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 12px 0; text-transform: uppercase; letter-spacing: 1px;">Marinduque State University</h1>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0; font-style: italic;">Tanza, Boac, Marinduque</p>
                        </div>
                      </td>
                    </tr>
                    <!-- Main Content Section with White Background -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 0;">
                        <!-- Logo Section with Overlap -->
                        <div style="text-align: center; margin-top: -60px; margin-bottom: 20px;">
                          <img src="https://www.marsu.edu.ph/logo.png" alt="MSU Logo" 
                               style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                        </div>
                        
                        <!-- Welcome Message -->
                        <div style="padding: 0 40px 30px;">
                          <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 20px;">Welcome to MarSUKAT!</h2>
                          
                          ${
                            role === "JobOrder" || role === "SuperAdmin" || role === "BAO"
                              ? `
                          <!-- Account Information Card -->
                          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 30px; margin: 30px 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                            <h3 style="color: #800000; font-size: 20px; font-weight: 600; margin: 0 0 20px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Account Information</h3>
                            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb;">
                              <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                    <p style="color: #64748b; font-size: 14px; margin: 0;">Name</p>
                                    <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 4px 0 0;">${name}</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                    <p style="color: #64748b; font-size: 14px; margin: 0;">Email</p>
                                    <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 4px 0 0;">${email}</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                    <p style="color: #64748b; font-size: 14px; margin: 0;">Role</p>
                                    <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 4px 0 0;">${role}</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 12px 0;">
                                    <p style="color: #64748b; font-size: 14px; margin: 0;">Password</p>
                                    <div style="background: #800000; padding: 8px 12px; border-radius: 6px; display: inline-block; margin-top: 4px;">
                                      <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0; font-family: monospace; letter-spacing: 1px;">${password}</p>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </div>
                            <div style="margin-top: 20px; padding: 12px; border-radius: 8px; background-color: #fff7ed; border: 1px solid #ffedd5;">
                              <p style="color: #9a3412; font-size: 14px; margin: 0; text-align: center; font-style: italic;">
                                Please change your password after your first login for security purposes.
                              </p>
                            </div>
                          </div>
                          `
                              : ""
                          }

                          <!-- Verification Section -->
                          <div style="text-align: center; background-color: #f8fafc; border-radius: 16px; padding: 30px; margin: 30px 0; border: 1px solid #e5e7eb;">
                            <h3 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 15px;">Email Verification Required</h3>
                            <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 20px;">Please verify your email address to complete the signup process.</p>
                            <p style="color: #64748b; font-size: 14px; margin: 0 0 25px;">This verification link will expire in 6 hours.</p>
                            <a href="${backendUrl}/api/v1/auth/verify/${_id}/${uniqueString}"
                               style="display: inline-block; background: #800000; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.2s;">
                              Verify Email
                            </a>
                          </div>

                          <!-- Security Notice -->
                          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                              If you did not request this, please ignore this message or contact support.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8fafc; padding: 20px 30px; border-radius: 0 0 16px 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                          © ${new Date().getFullYear()} MarSUKAT. All rights reserved.
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
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table role="presentation" style="width: 100%; border: none; margin: 0; padding: 0;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 94%; max-width: 600px; border: none; margin: 0; padding: 0;">
                    <!-- Header with Maroon Background -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #800000 0%, #b30000 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                        <div style="text-align: center;">
                          <h1 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Republic of the Philippines</h1>
                          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 12px 0; text-transform: uppercase; letter-spacing: 1px;">Marinduque State University</h1>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0; font-style: italic;">Tanza, Boac, Marinduque</p>
                        </div>
                      </td>
                    </tr>
                    <!-- Main Content Section with White Background -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 0;">
                        <!-- Logo Section with Overlap -->
                        <div style="text-align: center; margin-top: -60px; margin-bottom: 20px;">
                          <img src="https://www.marsu.edu.ph/logo.png" alt="MSU Logo" 
                               style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                        </div>
                        
                        <!-- Content Section -->
                        <div style="padding: 0 40px 30px;">
                          <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 20px;">Password Reset Request</h2>
                          
                          <!-- OTP Card -->
                          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 30px; margin: 30px 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                            <h3 style="color: #800000; font-size: 20px; font-weight: 600; margin: 0 0 20px; text-align: center;">Your OTP Code</h3>
                            <div style="background: #800000; padding: 25px; border-radius: 12px; text-align: center;">
                              <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff; margin: 0; font-family: monospace;">${otp}</p>
                            </div>
                            <div style="margin-top: 20px; padding: 12px; border-radius: 8px; background-color: #fff7ed; border: 1px solid #ffedd5;">
                              <p style="color: #9a3412; font-size: 14px; margin: 0; text-align: center; font-style: italic;">
                                This OTP will expire in 5 minutes.
                              </p>
                            </div>
                          </div>

                          <!-- Security Notice -->
                          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                              If you did not request this password reset, please ignore this message or contact support.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8fafc; padding: 20px 30px; border-radius: 0 0 16px 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                          © ${new Date().getFullYear()} MarSUKAT. All rights reserved.
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

// Send password change notification email
export const sendPasswordChangeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: {
        name: "MarSUKAT",
        address: process.env.AUTH_EMAIL,
      },
      to: email,
      subject: "Password Change Notification",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table role="presentation" style="width: 100%; border: none; margin: 0; padding: 0;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 94%; max-width: 600px; border: none; margin: 0; padding: 0;">
                    <!-- Header with Maroon Background -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #800000 0%, #b30000 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                        <div style="text-align: center;">
                          <h1 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Republic of the Philippines</h1>
                          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 12px 0; text-transform: uppercase; letter-spacing: 1px;">Marinduque State University</h1>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0; font-style: italic;">Tanza, Boac, Marinduque</p>
                        </div>
                      </td>
                    </tr>
                    <!-- Main Content Section with White Background -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 0;">
                        <!-- Logo Section with Overlap -->
                        <div style="text-align: center; margin-top: -60px; margin-bottom: 20px;">
                          <img src="https://www.marsu.edu.ph/logo.png" alt="MSU Logo" 
                               style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                        </div>
                        
                        <!-- Content Section -->
                        <div style="padding: 0 40px 30px;">
                          <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 20px;">Password Change Notification</h2>
                          
                          <!-- Message Card -->
                          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 30px; margin: 30px 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                            <p style="color: #1a1a1a; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                              Dear ${name},
                            </p>
                            <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                              This email is to confirm that your password was recently changed. If you made this change, no further action is required.
                            </p>
                            <div style="margin-top: 20px; padding: 12px; border-radius: 8px; background-color: #fff7ed; border: 1px solid #ffedd5;">
                              <p style="color: #9a3412; font-size: 14px; margin: 0; text-align: center; font-style: italic;">
                                If you did not change your password, please contact support immediately.
                              </p>
                            </div>
                          </div>

                          <!-- Security Notice -->
                          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                              For security reasons, please do not share your password with anyone.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8fafc; padding: 20px 30px; border-radius: 0 0 16px 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                          © ${new Date().getFullYear()} MarSUKAT. All rights reserved.
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
    console.error("Error sending password change email:", error);
    throw error;
  }
};

// Send account deactivation email
export const sendDeactivationEmail = async (email, name, reason) => {
  try {
    const mailOptions = {
      from: {
        name: "MarSUKAT",
        address: process.env.AUTH_EMAIL,
      },
      to: email,
      subject: "Account Deactivation Notice",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table role="presentation" style="width: 100%; border: none; margin: 0; padding: 0;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 94%; max-width: 600px; border: none; margin: 0; padding: 0;">
                    <!-- Header with Maroon Background -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #800000 0%, #b30000 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                        <div style="text-align: center;">
                          <h1 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Republic of the Philippines</h1>
                          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 12px 0; text-transform: uppercase; letter-spacing: 1px;">Marinduque State University</h1>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0; font-style: italic;">Tanza, Boac, Marinduque</p>
                        </div>
                      </td>
                    </tr>
                    <!-- Main Content Section with White Background -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 0;">
                        <!-- Logo Section with Overlap -->
                        <div style="text-align: center; margin-top: -60px; margin-bottom: 20px;">
                          <img src="https://www.marsu.edu.ph/logo.png" alt="MSU Logo" 
                               style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                        </div>
                        
                        <!-- Content Section -->
                        <div style="padding: 0 40px 30px;">
                          <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 20px;">Account Deactivation Notice</h2>
                          
                          <!-- Message Card -->
                          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 30px; margin: 30px 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                            <p style="color: #1a1a1a; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                              Dear ${name},
                            </p>
                            <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                              We regret to inform you that your account has been deactivated.
                            </p>
                            
                            <!-- Reason Section -->
                            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb;">
                              <h3 style="color: #800000; font-size: 18px; font-weight: 600; margin: 0 0 12px;">Reason for Deactivation:</h3>
                              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0;">
                                ${reason}
                              </p>
                            </div>

                            <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 20px 0;">
                              If you believe this is a mistake or would like to reactivate your account, please contact the administrator for assistance.
                            </p>
                          </div>

                          <!-- Contact Information -->
                          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                              For any questions or concerns, please contact our support team.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8fafc; padding: 20px 30px; border-radius: 0 0 16px 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                          © ${new Date().getFullYear()} MarSUKAT. All rights reserved.
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
    console.error("Error sending deactivation email:", error);
    throw error;
  }
};

export { transporter };
