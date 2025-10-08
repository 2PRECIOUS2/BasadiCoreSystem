import fetch from 'node-fetch';

async function testLogin() {
  console.log('Testing employee login...');
  
  // Test data based on the employee we found
  const testEmployee = {
    loginType: 'employee',
    email: 'janmoloto@gmail.com',
    employeeId: 15  // Jan Moloto's employee_id
  };
  
  try {
    console.log('Sending login request with:', testEmployee);
    
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmployee)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      const data = JSON.parse(responseText);
      console.log('User data:', data.user);
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testLogin();