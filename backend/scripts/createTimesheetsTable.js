import pkg from 'pg';
const { Pool } = pkg;
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTimesheetsTable() {
  try {
    console.log('Creating timesheets table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS timesheets (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          time_in TIME,
          time_out TIME,
          break_start TIME,
          break_end TIME,
          regular_hours DECIMAL(4,2) DEFAULT 0,
          overtime_hours DECIMAL(4,2) DEFAULT 0,
          notes TEXT,
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'declined', 'archived')),
          admin_notes TEXT,
          reviewed_by INTEGER REFERENCES users(id),
          submitted_at TIMESTAMP,
          reviewed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          -- Ensure one timesheet per employee per date
          UNIQUE(employee_id, date)
      );
    `;

    await pool.query(createTableQuery);
    console.log('✅ Timesheets table created successfully');

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_timesheets_employee_id ON timesheets(employee_id);',
      'CREATE INDEX IF NOT EXISTS idx_timesheets_date ON timesheets(date);',
      'CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);',
      'CREATE INDEX IF NOT EXISTS idx_timesheets_employee_date ON timesheets(employee_id, date);'
    ];

    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    console.log('✅ Indexes created successfully');

    // Add comments
    const comments = [
      "COMMENT ON TABLE timesheets IS 'Employee timesheet records for tracking work hours';",
      "COMMENT ON COLUMN timesheets.status IS 'Timesheet status: draft, submitted, approved, declined, archived';",
      "COMMENT ON COLUMN timesheets.regular_hours IS 'Regular working hours (up to 8 hours typically)';",
      "COMMENT ON COLUMN timesheets.overtime_hours IS 'Overtime hours worked';",
      "COMMENT ON COLUMN timesheets.admin_notes IS 'Admin notes for approval/decline reasons';",
      "COMMENT ON COLUMN timesheets.reviewed_by IS 'Admin user who reviewed the timesheet';"
    ];

    for (const commentQuery of comments) {
      await pool.query(commentQuery);
    }
    console.log('✅ Comments added successfully');

    console.log('✅ Timesheets table setup completed!');
    
  } catch (error) {
    console.error('❌ Error creating timesheets table:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  createTimesheetsTable();
}

module.exports = createTimesheetsTable;