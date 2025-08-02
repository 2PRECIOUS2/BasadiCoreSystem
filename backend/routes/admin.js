const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

module.exports = (pool) => {

  router.post('/approve/:userId', async (req, res) => {
    const { userId } = req.params;
    const staffId = `STAFF-${Date.now()}`;
    const approvedBy = req.body.superAdminId;  // Super admin ID must be passed from frontend

    let client;
    try {
      client = await pool.connect();
      const result = await client.query(
        `UPDATE users
         SET status = 'active',
             staff_id = $1,
             approved_by = $2,
             approved_at = NOW()
         WHERE id = $3 RETURNING *`,
        [staffId, approvedBy, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = result.rows[0];

      // Send approval email
      await sendEmail(user.email, 'Account Approved', approvalTemplate(user.name, staffId));

      res.status(200).json({ message: 'User approved and notified', staff_id: staffId });

    } catch (err) {
      console.error('Error approving user:', err);
      res.status(500).json({ message: 'Server error' });
    } finally {
      if (client) client.release();
    }
  });

  router.post('/reject/:userId', async (req, res) => {
    const { userId } = req.params;

    let client;
    try {
      client = await pool.connect();

      const result = await client.query(`SELECT * FROM users WHERE id = $1`, [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      const user = result.rows[0];

      await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

      // Send rejection email
      await sendEmail(user.email, 'Account Rejected', rejectionTemplate(user.name));

      res.status(200).json({ message: 'User rejected and notified' });

    } catch (err) {
      console.error('Error rejecting user:', err);
      res.status(500).json({ message: 'Server error' });
    } finally {
      if (client) client.release();
    }
  });

  return router;
};

// Email sending utility using Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',  // or another SMTP
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
};

// Templates
const approvalTemplate = (name, staffId) => `...`;  // Insert approval HTML template here
const rejectionTemplate = (name) => `...`;         // Insert rejection HTML template here
