import 'dotenv/config';
import dbModule from './db/index.js';

async function testEmployeeLoginQuery() {
  try {
    console.log('🔍 Testing employee login database query...');
    
    // Test basic connection first
    const timeResult = await dbModule.pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', timeResult.rows[0]);
    
    // Test the exact query from login route
    const email = 'janmoloto@gmail.com';
    const employeeId = 15;
    
    console.log(`🔍 Testing query: SELECT * FROM employees WHERE email = '${email}' AND employee_id = ${employeeId}`);
    
    const empResult = await dbModule.pool.query(
      'SELECT * FROM employees WHERE email = $1 AND employee_id = $2', 
      [email, employeeId]
    );
    
    console.log('📋 Query result:', {
      rowCount: empResult.rowCount,
      rows: empResult.rows.length
    });
    
    if (empResult.rows.length > 0) {
      const employee = empResult.rows[0];
      console.log('👤 Found employee:', {
        id: employee.employee_id,
        email: employee.email,
        firstName: employee.first_name,
        lastName: employee.last_name,
        role: employee.role,
        employmentStatus: employee.employment_status
      });
      
      // Check if active
      if (employee.employment_status === 'active') {
        console.log('✅ Employee is active - authentication would succeed');
      } else {
        console.log('❌ Employee is not active - authentication would fail');
      }
    } else {
      console.log('❌ No employee found - authentication would fail');
    }
    
  } catch (error) {
    console.error('💥 Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await dbModule.pool.end();
  }
}

testEmployeeLoginQuery();