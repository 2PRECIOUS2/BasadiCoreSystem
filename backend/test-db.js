require('dotenv').config(); // Load environment variables
const { pool } = require('./db');

// Let's test with a basic connection first
async function testCustomers() {
  try {
    console.log('🔍 Testing basic database query...');
    
    // Simple test query
    const testQuery = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection works:', testQuery.rows[0]);
    
    // Check if customers table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      );
    `);
    console.log('📋 Customers table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Get table structure
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'customers'
        ORDER BY column_name
      `);
      console.log('� Customer table columns:');
      structure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Count total records
      const count = await pool.query('SELECT COUNT(*) as total FROM customers');
      console.log('📊 Total customers in database:', count.rows[0].total);
      
      // Get sample data with exact field names
      const sample = await pool.query(`
        SELECT cust_id, cust_fname, cust_lname, cust_email, cust_status
        FROM customers 
        LIMIT 3
      `);
      console.log('� Sample customer data:');
      sample.rows.forEach((row, index) => {
        console.log(`  Customer ${index + 1}:`, row);
      });
    }
    
  } catch (error) {
    console.error('❌ Database test error:', error.message);
    if (error.code) {
      console.error('❌ Error code:', error.code);
    }
  } finally {
    process.exit(0);
  }
}

testCustomers();
