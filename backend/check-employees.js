import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkEmployeesTable() {
  try {
    console.log('Checking employees table structure...');
    
    // Get table structure
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'employees'
      ORDER BY column_name
    `);
    
    console.log('📋 Employees table columns:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Show first few employees with all columns
    const employees = await pool.query('SELECT * FROM employees LIMIT 2');
    console.log('\n👤 Sample employee data:');
    if (employees.rows.length > 0) {
      console.log('Column names:', Object.keys(employees.rows[0]));
      employees.rows.forEach((emp, index) => {
        console.log(`Employee ${index + 1}:`, emp);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkEmployeesTable();