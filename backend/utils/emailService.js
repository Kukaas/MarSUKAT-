import nodemailer from "nodemailer";
import dotenv from "dotenv";

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
                <p>Verify your email address to complete the signup process.</p>
                <p>This link expires in 6 hours.</p>
                <a href="${backendUrl}/api/v1/auth/verify/${_id}/${uniqueString}">Click here to verify</a>
            `,
    };

    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};
