require('dotenv').config();
const { pool } = require('./db');

async function testExactQuery() {
  try {
    console.log('🔍 Testing the exact SQL query from the API...');
    
    const result = await pool.query(`
      SELECT 
        cust_id as "customerNumber",
        cust_fname as "firstName",
        cust_lname as "lastName",
        COALESCE(cust_fname, '') || ' ' || COALESCE(cust_lname, '') as "customerName",
        cust_email as email,
        phone_number as "phoneNumber",
        country_code as "countryCode",
        phone_prefix as "phonePrefix",
        full_phone as phone,
        street_address as "streetAddress",
        city,
        state_province as "stateProvince",
        postal_code as "postalCode",
        country,
        TO_CHAR(date_of_birth, 'YYYY-MM-DD') as "dateOfBirth",
        cust_gender as gender,
        cust_status as status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM customers 
      ORDER BY 
        CASE WHEN cust_status = 'active' THEN 1 ELSE 2 END,
        cust_id DESC
    `);
    
    console.log('📊 Query returned', result.rows.length, 'rows');
    
    if (result.rows.length > 0) {
      console.log('📋 First row keys:', Object.keys(result.rows[0]));
      console.log('🔍 First row values:');
      const first = result.rows[0];
      console.log('  customerNumber:', first.customerNumber);
      console.log('  firstName:', first.firstName);
      console.log('  lastName:', first.lastName);
      console.log('  customerName:', first.customerName);
      console.log('  email:', first.email);
      console.log('  status:', first.status);
      console.log('🔍 Full first row:', first);
    }
    
  } catch (error) {
    console.error('❌ Query test error:', error.message);
    if (error.code) {
      console.error('❌ Error code:', error.code);
    }
    console.error('❌ Full error:', error);
  } finally {
    process.exit(0);
  }
}

testExactQuery();
