import 'dotenv/config';
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000';

async function testEmployeeLogin() {
    console.log('🧪 Testing Employee Login...');
    
    try {
        // Test with Jan Moloto (employee_id: 15, role: Support)
        const loginData = {
            loginType: 'employee',
            email: 'janmoloto@gmail.com',
            employeeId: 15 // Using the actual employee_id from database
        };

        console.log('📋 Login payload:', loginData);

        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        const responseData = await response.json();

        console.log('📤 Response status:', response.status);
        console.log('📥 Response data:', responseData);

        if (response.ok) {
            console.log('✅ Employee login successful!');
            console.log('👤 User data:', {
                id: responseData.user.id,
                name: `${responseData.user.firstName} ${responseData.user.lastName}`,
                email: responseData.user.email,
                role: responseData.user.role,
                employmentType: responseData.user.employmentType
            });
            
            // Return cookies for session test
            const cookies = response.headers.get('set-cookie');
            console.log('🍪 Session cookies received');
            return cookies;
        } else {
            console.log('❌ Employee login failed:', responseData.message);
            return null;
        }

    } catch (error) {
        console.error('💥 Login test error:', error.message);
        return null;
    }
}

// Test session check endpoint
async function testSessionCheck(cookies) {
    console.log('\n🧪 Testing Session Check...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/check-session`, {
            method: 'GET',
            headers: {
                'Cookie': cookies || ''
            }
        });

        const responseData = await response.json();

        console.log('📤 Response status:', response.status);
        console.log('📥 Response data:', responseData);

        if (response.ok) {
            console.log('✅ Session check successful!');
            console.log('⏰ Last activity:', new Date(responseData.lastActivity));
        } else {
            console.log('❌ Session check failed:', responseData.message);
        }

    } catch (error) {
        console.error('💥 Session check error:', error.message);
    }
}

// Test logout endpoint
async function testLogout(cookies) {
    console.log('\n🧪 Testing Logout...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/logout`, {
            method: 'POST',
            headers: {
                'Cookie': cookies || ''
            }
        });

        const responseData = await response.json();

        console.log('📤 Response status:', response.status);
        console.log('📥 Response data:', responseData);

        if (response.ok) {
            console.log('✅ Logout successful!');
        } else {
            console.log('❌ Logout failed:', responseData.message);
        }

    } catch (error) {
        console.error('💥 Logout test error:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting authentication and session tests...\n');
    
    const cookies = await testEmployeeLogin();
    if (cookies) {
        await testSessionCheck(cookies);
        await testLogout(cookies);
        
        // Test session after logout
        console.log('\n🧪 Testing Session After Logout...');
        await testSessionCheck(cookies);
    }
}

runTests();