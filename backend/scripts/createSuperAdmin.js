import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Pool } = pkg;

// Adjust this to match your .env or use environment variables
const pool = new Pool({
  user: process.env.DB_USER || 'your_db_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'your_db_name',
  password: process.env.DB_PASSWORD || 'your_db_password',
  port: process.env.DB_PORT || 5432,
});


(async () => {
  try {
    const firstName = 'Basadi'; // Set your super admin's first name
    const lastName = 'Core';    // Set your super admin's last name
    const plainPassword = 'BasadiCoreSystem@2025Since2010'; // CHANGE THIS before running!
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (id, first_name, last_name, email, password, role, status, registration_date)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'superadmin', 'approved', NOW()) RETURNING *`,
      [firstName, lastName, 'basadicore@gmail.com', hashedPassword]
    );

    console.log('Super admin created:', result.rows[0]);
  } catch (err) {
    console.error('Error creating super admin:', err.message);
  } finally {
    process.exit(0);
  }
})();