import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkTables() {
  try {
    console.log('Checking database structure...');
    
    // Check available tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Available tables:');
    result.rows.forEach(row => console.log('- ' + row.table_name));
    
    // Check orders table structure
    const ordersColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nOrders table columns:');
    ordersColumns.rows.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));
    
    // Check orderitems table structure
    const orderItemsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orderitems' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nOrderItems table columns:');
    orderItemsColumns.rows.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));
    
    // Check sample orderitems data
    const sampleOrderItems = await pool.query('SELECT * FROM orderitems LIMIT 3');
    console.log('\nSample orderitems data:');
    console.log(sampleOrderItems.rows);
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
  }
}

checkTables();