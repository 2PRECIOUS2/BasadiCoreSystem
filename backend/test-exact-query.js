import 'dotenv/config';
import dbModule from './db/index.js';

async function testExactQuery() {
  try {
    console.log('🔍 Testing the exact employee login query...');
    
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
      
      console.log('✅ Employee authentication would succeed');
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

testExactQuery();
    
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
