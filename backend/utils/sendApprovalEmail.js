// filepath: backend/utils/sendApprovalEmail.js
const nodemailer = require('nodemailer');

// You can load your email template here if you want
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send approval email
async function sendApprovalEmail(to, name, staffId) {
  const html = `
    <h2>🎉 Congratulations, ${name}!</h2>
    <p>Your account has been approved by the House of Basadi super admin.</p>
    <p>Your Staff ID is: <strong>${staffId}</strong></p>
    <p>You can now log in with your email and password.</p>
    <p>Welcome aboard!</p>
    <a href="http://localhost:5173/auth/login">Go to Login</a>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Account Approved',
    html,
  });
}

module.exports = sendApprovalEmail;