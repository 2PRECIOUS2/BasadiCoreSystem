// Quick test to check database table structures
import 'dotenv/config';
import dbModule from './db/index.js';

async function checkTables() {
  try {
    console.log('Checking database table structures...');
    
    // Check orders table
    console.log('\n=== ORDERS TABLE ===');
    const ordersStructure = await dbModule.pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
      ORDER BY ordinal_position;
    `);
    console.log('Orders columns:', ordersStructure.rows);
    
    // Check products table
    console.log('\n=== PRODUCTS TABLE ===');
    const productsStructure = await dbModule.pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `);
    console.log('Products columns:', productsStructure.rows);
    
    // Check customers table
    console.log('\n=== CUSTOMERS TABLE ===');
    const customersStructure = await dbModule.pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customers'
      ORDER BY ordinal_position;
    `);
    console.log('Customers columns:', customersStructure.rows);
    
    // Test a simple query
    console.log('\n=== SIMPLE TEST QUERY ===');
    const testQuery = await dbModule.pool.query('SELECT COUNT(*) as total_orders FROM orders');
    console.log('Total orders:', testQuery.rows[0]);
    
  } catch (err) {
    console.error('Error checking tables:', err);
  } finally {
    process.exit(0);
  }
}

checkTables();