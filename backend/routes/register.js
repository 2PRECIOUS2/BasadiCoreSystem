import express from 'express';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const router = express.Router();

const registerRoutes = (pool) => {
  router.post('/', async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      // Email validation
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  // Password validation
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters, include uppercase, number, and special character.'
    });
  }
    let client;
    try {
      client = await pool.connect();
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await client.query(
        `INSERT INTO users (id, first_name, last_name, email, password, role, status, registration_date)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'pending', NOW()) RETURNING *`,
        [firstName, lastName, email, hashedPassword, role]
      );
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        // Email to super admin
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: 'basadicor@gmail.com',
          subject: 'New Registration Request',
          html: `<p>User <b>${firstName} ${lastName}</b> (${email}) has requested registration as <b>${role}</b>.</p>`
        });
        // Email to user
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your Registration Request Received',
          html: `<p>Dear ${firstName},<br>Your registration request has been received and is pending approval. You will be notified once it is reviewed.</p>`
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

export default registerRoutes;