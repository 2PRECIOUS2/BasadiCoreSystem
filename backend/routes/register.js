const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

module.exports = (pool) => {
  router.post('/', async (req, res) => {
    const { name, email, password, role } = req.body;
    let client;
    try {
      client = await pool.connect();
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await client.query(
        `INSERT INTO users (id, name, email, password, role, status, registration_date)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending', NOW()) RETURNING *`,
        [name, email, hashedPassword, role]
      );
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: 'basadicor@gmail.com',
          subject: 'New Registration Request',
          html: `<p>User <b>${name}</b> (${email}) has requested registration as <b>${role}</b>.</p>`
        });
      } catch (emailErr) {
        console.error('Email failed:', emailErr);
      }
      res.status(201).json({ success: true, message: 'Registration submitted. Awaiting approval.' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Registration failed.' });
    } finally {
      if (client) client.release();
    }
  });
  return router;
};