import express from 'express';
import bcrypt from 'bcryptjs';

const router = express.Router();

const loginRoutes = (pool) => {
    // Login route
    router.post('/', async (req, res) => {
        console.log('🔍 LOGIN REQUEST:', req.body);
        const { loginType, email, employeeId, password } = req.body;

        try {
            let userData = null;
            console.log('🎯 Login type:', loginType);

            if (loginType === 'super_admin') {
                // Super Admin login via users table
                if (!email || !password) {
                    return res.status(400).json({ message: 'Email and password are required for Super Admin login' });
                }

                const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
                
                if (userResult.rows.length === 0) {
                    return res.status(404).json({ message: 'Super Admin account not found' });
                }

                const user = userResult.rows[0];

                // Check if user is active
                if (user.status !== 'active') {
                    return res.status(401).json({ message: 'Account is not active. Contact administrator.' });
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: 'Invalid email or password' });
                }

                userData = {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    first_name: user.first_name, // Alternative key name for frontend compatibility
                    last_name: user.last_name,   // Alternative key name for frontend compatibility
                    role: user.role,
                    source: 'users',
                    loginType: 'super_admin',
                    accessRights: {
                        timesheets: true,
                        projects: true,
                        dashboard: true,
                        reports: true,
                        orders: true,
                        customers: true,
                        products: true,
                        materials: true,
                        employees: true,
                        approval: true,
                        everything: true
                    }
                };

            } else if (loginType === 'employee') {
                console.log('👨‍💼 Processing Employee login...');
                // Employee login via employees table (no password required)
                if (!email || !employeeId) {
                    console.log('❌ Missing credentials');
                    return res.status(400).json({ message: 'Email and Employee ID are required for Employee login' });
                }

                // Convert employeeId to number and validate
                console.log('🧩 Employee login attempt:', { email, employeeId });
                const empId = parseInt(employeeId, 10);
                
                if (isNaN(empId)) {
                    console.log('❌ Invalid employee ID format');
                    return res.status(400).json({ message: 'Invalid Employee ID format' });
                }

                console.log('🔍 Querying employees table...');
                const empResult = await pool.query(
                    'SELECT * FROM employees WHERE email = $1 AND employee_id = $2', 
                    [email, empId]
                );
                
                console.log('📊 Employee query result count:', empResult.rows.length);
                console.log('🔍 Query result rows:', empResult.rows);
                
                if (empResult.rows.length === 0) {
                    console.log('❌ Employee not found');
                    return res.status(404).json({ message: 'Employee account not found or email/ID mismatch' });
                }

                const employee = empResult.rows[0];
                console.log('👤 Found employee:', { 
                    email: employee.email, 
                    employee_id: employee.employee_id,
                    role: employee.role,
                    employment_status: employee.employment_status 
                });

                // Check if employee is active
                if (employee.employment_status !== 'active') {
                    console.log('❌ Employee not active:', employee.employment_status);
                    return res.status(401).json({ message: 'Account is not active. Contact administrator.' });
                }

                // 🎯 ROLE-BASED ACCESS CONTROL - Updated to match frontend RBAC
                let accessRights = {};
                const role = employee.role.toLowerCase();

                console.log('👤 Employee role:', role);

                switch (role) {
                    case 'support':
                    case 'trainer':
                        console.log('🎯 Setting Support/Trainer permissions');
                        accessRights = {
                            dashboard: false,
                            timesheets: true,
                            projects: true,
                            customers: false,
                            orders: false,
                            products: false,
                            materials: false,
                            employees: false,
                            approval: false,
                            reports: false,
                            advertisement: false,
                            everything: false,
                            // Timesheet specific permissions
                            timesheets_create: true,
                            timesheets_view_own: true,
                            timesheets_view_all: false,
                            timesheets_approve: false,
                            timesheets_reject: false,
                            timesheets_edit_all: false
                        };
                        break;
                    
                    case 'accountant':
                        console.log('🎯 Setting Accountant permissions');
                        accessRights = {
                            dashboard: true,
                            timesheets: true,
                            projects: false,
                            customers: true,
                            orders: true,
                            products: false,
                            materials: false,
                            employees: false,
                            approval: false,
                            reports: true,
                            advertisement: false,
                            everything: false,
                            // Timesheet specific permissions
                            timesheets_create: true,
                            timesheets_view_own: true,
                            timesheets_view_all: false,
                            timesheets_approve: false,
                            timesheets_reject: false,
                            timesheets_edit_all: false
                        };
                        break;
                    
                    case 'administrator':
                        console.log('🎯 Setting Administrator permissions');
                        accessRights = {
                            dashboard: true,
                            timesheets: true,
                            projects: true,
                            customers: true,
                            orders: true,
                            products: true,
                            materials: true,
                            employees: false, // Admins cannot manage employees
                            approval: false,  // Admins cannot approve/reject timesheets
                            reports: true,
                            advertisement: true,
                            everything: false,
                            // Timesheet specific permissions
                            timesheets_create: true,
                            timesheets_view_own: true,
                            timesheets_view_all: true,
                            timesheets_approve: false,
                            timesheets_reject: false,
                            timesheets_edit_all: false
                        };
                        break;
                    
                    case 'admin':
                        console.log('🎯 Setting Admin (restricted) permissions');
                        accessRights = {
                            dashboard: false,  // Admin cannot see dashboard
                            timesheets: true,
                            projects: true,
                            customers: true,
                            orders: false,     // Admin cannot see orders
                            products: false,   // Admin cannot see products
                            materials: false,  // Admin cannot see materials
                            employees: false,
                            approval: false,
                            reports: true,
                            advertisement: false, // Admin cannot see advertisement
                            everything: false,
                            // Timesheet specific permissions
                            timesheets_create: true,
                            timesheets_view_own: true,
                            timesheets_view_all: true,
                            timesheets_approve: false,
                            timesheets_reject: false,
                            timesheets_edit_all: false
                        };
                        break;
                    
                    default:
                        console.log('🎯 Setting default employee permissions for role:', role);
                        accessRights = {
                            dashboard: false,
                            timesheets: true,
                            projects: false,
                            customers: false,
                            orders: false,
                            products: false,
                            materials: false,
                            employees: false,
                            approval: false,
                            reports: false,
                            advertisement: false,
                            everything: false,
                            // Timesheet specific permissions
                            timesheets_create: true,
                            timesheets_view_own: true,
                            timesheets_view_all: false,
                            timesheets_approve: false,
                            timesheets_reject: false,
                            timesheets_edit_all: false
                        };
                }

                userData = {
                    id: employee.employee_id,
                    employeeId: employee.employee_id,
                    employee_id: employee.employee_id, // Alternative key name for timesheet auto-fill
                    email: employee.email,
                    firstName: employee.first_name,
                    lastName: employee.last_name,
                    first_name: employee.first_name,   // Alternative key name for frontend compatibility
                    last_name: employee.last_name,     // Alternative key name for frontend compatibility
                    role: employee.role,
                    employmentType: employee.employment_type,
                    source: 'employees',
                    loginType: 'employee',
                    accessRights
                };

                console.log('✅ Employee userData created:', userData);

            } else {
                console.log('❌ Invalid login type:', loginType);
                return res.status(400).json({ message: 'Invalid login type' });
            }

            console.log('💾 Setting session data...');
            // Set session data
            req.session.user = userData;
            req.session.lastActivity = Date.now();

            console.log('💾 Saving session...');
            // Save session and return user data
            req.session.save((err) => {
                if (err) {
                    console.error('❌ Session save error:', err);
                    return res.status(500).json({ message: 'Failed to create session' });
                }
                
                console.log('✅ Session saved successfully for user:', userData.email);
                console.log('🔑 Access Rights:', userData.accessRights);
                console.log('🎉 Sending success response...');
                
                return res.json({ 
                    message: "Login successful", 
                    user: userData,
                    sessionId: req.sessionID 
                });
            });

        } catch (error) {
            console.error('💥 CRITICAL ERROR during login:', error);
            console.error('💥 Error stack:', error.stack);
            return res.status(500).json({ message: 'Internal server error during login' });
        }
    });

    return router;
};

export default loginRoutes;