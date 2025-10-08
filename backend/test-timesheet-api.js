import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
    // These would normally come from a logged-in session
    employee_id: 1, // Replace with actual employee ID
    project_id: 1,  // Replace with actual project ID
    test_date: '2025-01-06'
};

// Helper function to make requests with session simulation
async function makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'connect.sid=your_session_id_here', // Replace with actual session
            ...options.headers
        },
        ...options
    };
    
    console.log(`\n🔗 Making ${config.method || 'GET'} request to: ${url}`);
    if (config.body) {
        console.log('📝 Request body:', JSON.parse(config.body));
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        return { response, data };
    } catch (error) {
        console.error('❌ Request failed:', error.message);
        return { error };
    }
}

// Test functions
async function testCreateTimesheet() {
    console.log('\n=== Testing Create Timesheet ===');
    
    const timesheetData = {
        project_id: testConfig.project_id,
        date: testConfig.test_date,
        start_time: '09:00:00',
        end_time: '17:00:00',
        break_duration: 60, // 1 hour break
        work_done: 'Worked on API development and testing',
        status: 'draft'
    };
    
    return await makeRequest('/timesheets', {
        method: 'POST',
        body: JSON.stringify(timesheetData)
    });
}

async function testGetTimesheets() {
    console.log('\n=== Testing Get All Timesheets ===');
    
    return await makeRequest('/timesheets?limit=10&offset=0');
}

async function testGetTimesheetById(timesheetId) {
    console.log('\n=== Testing Get Timesheet by ID ===');
    
    return await makeRequest(`/timesheets/${timesheetId}`);
}

async function testUpdateTimesheet(timesheetId) {
    console.log('\n=== Testing Update Timesheet ===');
    
    const updateData = {
        work_done: 'Updated: Worked on API development, testing, and documentation',
        end_time: '18:00:00'
    };
    
    return await makeRequest(`/timesheets/${timesheetId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
    });
}

async function testSubmitTimesheet(timesheetId) {
    console.log('\n=== Testing Submit Timesheet ===');
    
    return await makeRequest(`/timesheets/${timesheetId}/submit`, {
        method: 'POST'
    });
}

async function testApproveTimesheet(timesheetId) {
    console.log('\n=== Testing Approve Timesheet (Admin) ===');
    
    return await makeRequest(`/timesheets/${timesheetId}/approve`, {
        method: 'POST'
    });
}

async function testRejectTimesheet(timesheetId) {
    console.log('\n=== Testing Reject Timesheet (Admin) ===');
    
    const rejectionData = {
        rejection_reason: 'Missing project details'
    };
    
    return await makeRequest(`/timesheets/${timesheetId}/reject`, {
        method: 'POST',
        body: JSON.stringify(rejectionData)
    });
}

async function testEmployeeSummary() {
    console.log('\n=== Testing Employee Summary ===');
    
    return await makeRequest(`/timesheets/employee/${testConfig.employee_id}/summary?month=1&year=2025`);
}

async function testDeleteTimesheet(timesheetId) {
    console.log('\n=== Testing Delete Timesheet ===');
    
    return await makeRequest(`/timesheets/${timesheetId}`, {
        method: 'DELETE'
    });
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Timesheet API Tests');
    console.log('⚠️  Note: Make sure the server is running and you have valid session/authentication');
    
    let timesheetId = null;
    
    try {
        // Test 1: Create timesheet
        const createResult = await testCreateTimesheet();
        if (createResult.data && createResult.data.success) {
            timesheetId = createResult.data.data.id;
            console.log(`✅ Created timesheet with ID: ${timesheetId}`);
        }
        
        // Test 2: Get all timesheets
        await testGetTimesheets();
        
        // Test 3: Get specific timesheet (if we have an ID)
        if (timesheetId) {
            await testGetTimesheetById(timesheetId);
            
            // Test 4: Update timesheet
            await testUpdateTimesheet(timesheetId);
            
            // Test 5: Submit timesheet
            await testSubmitTimesheet(timesheetId);
            
            // Test 6: Approve timesheet (requires admin role)
            // await testApproveTimesheet(timesheetId);
            
            // Test 7: Reject timesheet (alternative to approve)
            // await testRejectTimesheet(timesheetId);
        }
        
        // Test 8: Employee summary
        await testEmployeeSummary();
        
        // Test 9: Delete timesheet (only works for drafts)
        // if (timesheetId) {
        //     await testDeleteTimesheet(timesheetId);
        // }
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
    
    console.log('\n🏁 Test suite completed');
}

// Run the tests
runTests();