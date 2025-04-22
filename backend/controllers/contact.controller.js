import { transporter } from "../utils/emailService.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    // Email content
    const mailOptions = {
      from: {
        name: "MarSUKAT Contact Form",
        address: process.env.AUTH_EMAIL,
      },
      to: "chestermaligaso29@gmail.com", // Target email address
      subject: `MarSUKAT Contact Form: ${name}`,
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
                          <img src="https://www.marsu.edu.ph/logo.png" alt="MSU Logo" 
                               style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px;" />
                          <h1 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Republic of the Philippines</h1>
                          <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 10px 0; text-transform: uppercase; letter-spacing: 1px;">Marinduque State University</h1>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin: 0; font-style: italic;">Tanza, Boac, Marinduque</p>
                        </div>
                      </td>
                    </tr>
                    <!-- Main Content Section -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 40px 30px;">
                        <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px;">New Contact Form Submission</h2>
                        
                        <!-- Contact Information Card -->
                        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 30px; margin: 20px 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                          <h3 style="color: #800000; font-size: 20px; font-weight: 600; margin: 0 0 20px; text-align: center;">Contact Information</h3>
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
                                <td style="padding: 12px 0;">
                                  <p style="color: #64748b; font-size: 14px; margin: 0;">Phone</p>
                                  <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 4px 0 0;">${phone}</p>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </div>
                        
                        <!-- Message Card -->
                        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 30px; margin: 20px 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                          <h3 style="color: #800000; font-size: 20px; font-weight: 600; margin: 0 0 20px; text-align: center;">Message</h3>
                          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <p style="color: #1a1a1a; font-size: 16px; line-height: 24px; white-space: pre-wrap;">${message}</p>
                          </div>
                        </div>
                        
                        <!-- Reply Instructions -->
                        <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 20px; margin: 20px 0 0;">
                          <p style="color: #9a3412; font-size: 14px; margin: 0; text-align: center;">
                            To reply to this inquiry, simply respond directly to this email or contact the sender at their provided email address.
                          </p>
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

    // Send email using the existing transporter from emailService.js
    await transporter.sendMail(mailOptions);

    // Also send an acknowledgment to the user
    const acknowledgmentMail = {
      from: {
        name: "MarSUKAT",
        address: process.env.AUTH_EMAIL,
      },
      to: email,
      subject: "Thank You for Contacting MarSUKAT",
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
                          <img src="https://www.marsu.edu.ph/logo.png" alt="MSU Logo" 
                               style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px;" />
                          <h1 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Republic of the Philippines</h1>
                          <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 10px 0; text-transform: uppercase; letter-spacing: 1px;">Marinduque State University</h1>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin: 0; font-style: italic;">Tanza, Boac, Marinduque</p>
                        </div>
                      </td>
                    </tr>
                    <!-- Main Content Section -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 40px 30px;">
                        <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px;">Thank You for Contacting Us</h2>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                          Dear ${name},
                        </p>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                          Thank you for reaching out to the Marinduque State University. We have received your message and will get back to you as soon as possible.
                        </p>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                          If your inquiry is urgent, please contact us directly at our office during business hours:
                        </p>
                        
                        <!-- Business Hours Card -->
                        <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 16px; padding: 25px; margin: 20px 0;">
                          <h4 style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin: 0 0 15px;">Business Hours</h4>
                          <ul style="color: #4b5563; padding-left: 20px; margin: 0;">
                            <li style="margin-bottom: 8px;">Monday - Thursday: 7:30 AM - 4:30 PM</li>
                            <li style="margin-bottom: 8px;">Friday: No Transactions</li>
                            <li>Saturday - Sunday: Closed</li>
                          </ul>
                        </div>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 20px 0 0;">
                          Best regards,<br>
                          The MarSUKAT Team
                        </p>
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
    
    await transporter.sendMail(acknowledgmentMail);

    res.status(200).json({
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    res.status(500).json({
      message: "Failed to send message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
