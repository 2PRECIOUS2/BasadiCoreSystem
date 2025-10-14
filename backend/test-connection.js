import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

console.log('Testing database connection...');
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    console.log('Attempting database connection...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful:', result.rows[0]);
    
    // Test if employees table exists
    const empCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'employees'
      );
    `);
    console.log('📋 Employees table exists:', empCheck.rows[0].exists);
    
    if (empCheck.rows[0].exists) {
      // Check if there are any employees
      const empCount = await pool.query('SELECT COUNT(*) FROM employees');
      console.log('👥 Employee count:', empCount.rows[0].count);
      
      // Show first few employees with roles
      const employees = await pool.query('SELECT employee_id, email, first_name, last_name, role, employment_status FROM employees LIMIT 3');
      console.log('👤 Sample employees:', employees.rows);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();