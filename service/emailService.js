const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, EMAIL_ENV, PASSWORD_ENV } = require("../constants/env");


async function sendOneTimeLink(toEmail, token) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or another email service
    auth: {
      user: EMAIL_ENV,
      pass: PASSWORD_ENV,
    },
  });
  const mailOptions = {
    from: EMAIL_ENV,
    to: toEmail,
    subject: 'Email Verification',
    html: `<p>Please use the following <a href="http://localhost:4200/setPassword?token=${encodeURIComponent(
      token
    )}">link</a> to verify your email. Link expires in 1 hour.</p>`,
  };
  await transporter.sendMail(mailOptions);
  console.log('Email sent successfully!');
}

function generateToken(uniqueID) {
  const expiry = '1h'; // Token expires in 1 hour
  const secretKey = JWT_SECRET; // Use a secure, environment-specific key

  const payload = { userID: uniqueID }; // Payload containing user ID
  return jwt.sign(payload, secretKey, { expiresIn: expiry });
}

module.exports = {
  generateToken,
  sendOneTimeLink
}