import fetch from 'node-fetch';

async function testBasicEndpoint() {
    console.log('🧪 Testing basic server endpoint...');
    
    try {
        const response = await fetch('http://localhost:5000/', {
            method: 'GET'
        });
        
        const data = await response.json();
        console.log('📤 Status:', response.status);
        console.log('📥 Response:', data);
        
        if (response.ok) {
            console.log('✅ Basic endpoint working');
        } else {
            console.log('❌ Basic endpoint failed');
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

testBasicEndpoint();