const { pool } = require('./db');

async function checkProjects() {
  try {
    console.log('Checking projects table...');
    
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      );
    `);
    console.log('Projects table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'projects'
        ORDER BY column_name
      `);
      console.log('Projects table columns:');
      structure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Get sample data
      const sample = await pool.query('SELECT * FROM projects LIMIT 2');
      console.log('Sample projects data:');
      sample.rows.forEach((row, index) => {
        console.log(`  Project ${index + 1}:`, row);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkProjects();
