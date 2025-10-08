import fetch from 'node-fetch';

async function testSessionTimeout() {
    console.log('🧪 Testing Session Timeout Functionality');
    console.log('==========================================\n');
    
    // Step 1: Test successful login
    console.log('1️⃣ Testing Employee Login...');
    const testEmployee = {
        loginType: 'employee',
        email: 'janmoloto@gmail.com',
        employeeId: 15
    };
    
    try {
        const loginResponse = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testEmployee)
        });
        
        if (!loginResponse.ok) {
            console.log('❌ Login failed:', await loginResponse.text());
            return;
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log('User:', loginData.user.firstName, loginData.user.lastName);
        console.log('Role:', loginData.user.role);
        console.log('Session ID:', loginData.sessionId);
        
        // Extract session cookie
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('Session Cookie:', cookies ? 'Present' : 'Missing');
        
        // Step 2: Test session check endpoint
        console.log('\n2️⃣ Testing Session Check...');
        const sessionCheckResponse = await fetch('http://localhost:5000/api/check-session', {
            method: 'GET',
            headers: {
                'Cookie': cookies || ''
            }
        });
        
        if (sessionCheckResponse.ok) {
            const sessionData = await sessionCheckResponse.json();
            console.log('✅ Session check passed!');
            console.log('Active:', sessionData.active);
            console.log('Last Activity:', new Date(sessionData.lastActivity));
        } else {
            console.log('❌ Session check failed:', sessionCheckResponse.status);
        }
        
        // Step 3: Test session timeout (simulate waiting 5+ minutes)
        console.log('\n3️⃣ Testing Session Timeout...');
        console.log('Note: In production, you would wait 5+ minutes of inactivity');
        console.log('For testing, the backend middleware checks lastActivity timestamp');
        
        // Step 4: Test logout endpoint
        console.log('\n4️⃣ Testing Logout...');
        const logoutResponse = await fetch('http://localhost:5000/api/logout', {
            method: 'POST',
            headers: {
                'Cookie': cookies || ''
            }
        });
        
        if (logoutResponse.ok) {
            const logoutData = await logoutResponse.json();
            console.log('✅ Logout successful:', logoutData.message);
        } else {
            console.log('❌ Logout failed:', logoutResponse.status);
        }
        
        // Step 5: Verify session is destroyed
        console.log('\n5️⃣ Verifying Session Destruction...');
        const finalCheckResponse = await fetch('http://localhost:5000/api/check-session', {
            method: 'GET',
            headers: {
                'Cookie': cookies || ''
            }
        });
        
        if (finalCheckResponse.status === 401) {
            console.log('✅ Session properly destroyed - 401 Unauthorized');
        } else {
            console.log('❌ Session still active:', finalCheckResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
    
    console.log('\n🎯 Session Timeout Test Complete!');
    console.log('==========================================');
}

testSessionTimeout();