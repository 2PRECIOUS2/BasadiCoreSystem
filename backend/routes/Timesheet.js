import express from 'express';

const router = express.Router();

const timesheetRoutes = (pool) => {
    
    // Helper function to check if user is admin
    const isAdmin = (req) => {
        const userRole = req.session?.user?.role;
        return ['super_admin', 'admin', 'administrator'].includes(userRole);
    };

    // GET /api/timesheets - Get all timesheets with proper filtering
    router.get('/', async (req, res) => {
        try {
            console.log('🔍 GET /api/timesheets - Request received');
            console.log('🔍 Session user:', req.session?.user);
            console.log('🔍 Query params:', req.query);

            const { employee_id, project_id, status, date_from, date_to, limit = 50, offset = 0 } = req.query;
            
            // Check if user is authenticated
            if (!req.session?.user) {
                console.log('❌ No user session found');
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const currentUser = req.session.user;
            const userIsAdmin = isAdmin({ session: { user: currentUser } });
            
            console.log('🔍 User role:', currentUser.role);
            console.log('🔍 Is admin:', userIsAdmin);

            // Build the main query with correct table joins
            let query = `
                SELECT 
                    t.id,
                    t.employee_id,
                    e.first_name,
                    e.last_name,
                    e.email,
                    t.project_id,
                    p.project_name,
                    t.date,
                    t.start_time,
                    t.end_time,
                    t.break_duration,
                    t.total_hours,
                    t.work_done,
                    t.status,
                    t.created_at,
                    t.updated_at,
                    t.submitted_at,
                    t.approved_at,
                    u.first_name AS approver_first_name,
                    u.last_name AS approver_last_name,
                    t.rejection_reason
                FROM timesheets t
                LEFT JOIN employees e ON t.employee_id = e.employee_id
                LEFT JOIN projects p ON t.project_id = p.project_id
                LEFT JOIN users u ON t.approved_by = u.id
                WHERE 1=1
            `;

            const queryParams = [];
            let paramIndex = 1;

            // Role-based filtering
            if (!userIsAdmin) {
                // Non-admin users can only see their own timesheets
                const userEmployeeId = currentUser.employeeId || currentUser.employee_id || currentUser.id;
                query += ` AND t.employee_id = $${paramIndex}`;
                queryParams.push(userEmployeeId);
                paramIndex++;
                console.log('🔍 Filtering for employee_id:', userEmployeeId);
            } else if (employee_id) {
                // Admin can filter by specific employee
                query += ` AND t.employee_id = $${paramIndex}`;
                queryParams.push(parseInt(employee_id));
                paramIndex++;
                console.log('🔍 Admin filtering for employee_id:', employee_id);
            }

            // Additional filters
            if (project_id) {
                query += ` AND t.project_id = $${paramIndex}`;
                queryParams.push(parseInt(project_id));
                paramIndex++;
            }

            if (status) {
                query += ` AND t.status = $${paramIndex}`;
                queryParams.push(status);
                paramIndex++;
            }

            if (date_from) {
                query += ` AND t.date >= $${paramIndex}`;
                queryParams.push(date_from);
                paramIndex++;
            }

            if (date_to) {
                query += ` AND t.date <= $${paramIndex}`;
                queryParams.push(date_to);
                paramIndex++;
            }

            // Add ordering and pagination
            query += ` ORDER BY t.date DESC, t.created_at DESC`;
            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            queryParams.push(parseInt(limit), parseInt(offset));

            console.log('🔍 Final query:', query);
            console.log('🔍 Query params:', queryParams);

            // Execute the query
            const result = await pool.query(query, queryParams);
            
            console.log('✅ Query executed successfully');
            console.log('✅ Found', result.rows.length, 'timesheets');

            // Get total count for pagination
            let countQuery = `
                SELECT COUNT(*) as total
                FROM timesheets t
                WHERE 1=1
            `;
            
            const countParams = [];
            let countParamIndex = 1;

            // Apply same filters to count query
            if (!userIsAdmin) {
                const userEmployeeId = currentUser.employeeId || currentUser.employee_id || currentUser.id;
                countQuery += ` AND t.employee_id = $${countParamIndex}`;
                countParams.push(userEmployeeId);
                countParamIndex++;
            } else if (employee_id) {
                countQuery += ` AND t.employee_id = $${countParamIndex}`;
                countParams.push(parseInt(employee_id));
                countParamIndex++;
            }

            if (project_id) {
                countQuery += ` AND t.project_id = $${countParamIndex}`;
                countParams.push(parseInt(project_id));
                countParamIndex++;
            }

            if (status) {
                countQuery += ` AND t.status = $${countParamIndex}`;
                countParams.push(status);
                countParamIndex++;
            }

            if (date_from) {
                countQuery += ` AND t.date >= $${countParamIndex}`;
                countParams.push(date_from);
                countParamIndex++;
            }

            if (date_to) {
                countQuery += ` AND t.date <= $${countParamIndex}`;
                countParams.push(date_to);
                countParamIndex++;
            }

            const countResult = await pool.query(countQuery, countParams);
            const totalCount = parseInt(countResult.rows[0].total);

            console.log('✅ Total count:', totalCount);

            res.json({
                success: true,
                data: result.rows,
                count: totalCount,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: totalCount,
                    pages: Math.ceil(totalCount / parseInt(limit))
                },
                message: 'Timesheets retrieved successfully'
            });

        } catch (error) {
            console.error('❌ Error fetching timesheets:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch timesheets',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // POST /api/timesheets - Create new timesheet
    router.post('/', async (req, res) => {
        try {
            console.log('🔍 POST /api/timesheets - Create timesheet request');
            console.log('🔍 Session user data:', req.session?.user);
            console.log('🔍 Request body:', req.body);

            const { date, start_time, end_time, break_duration = 0, work_done, project_id = null } = req.body;
            
            // Get employee_id from session
            const user = req.session.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Use employee_id from session (multiple possible field names)
            const employee_id = user.employeeId || user.employee_id || user.id;
            
            console.log('🔍 Extracted employee_id:', employee_id);
            
            if (!employee_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee ID not found in session. Please re-login.'
                });
            }

            // Validate required fields
            if (!date || !start_time || !end_time || !work_done) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: date, start_time, end_time, work_done'
                });
            }

            // Check if timesheet already exists for this employee and date
            const existingTimesheet = await pool.query(
                'SELECT id FROM timesheets WHERE employee_id = $1 AND date = $2',
                [employee_id, date]
            );

            if (existingTimesheet.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Timesheet already exists for this date'
                });
            }

            // Insert new timesheet
            const result = await pool.query(
                `INSERT INTO timesheets 
                 (employee_id, project_id, date, start_time, end_time, break_duration, work_done, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
                 RETURNING *`,
                [employee_id, project_id, date, start_time, end_time, break_duration, work_done]
            );

            console.log(`✅ Timesheet created for employee ${employee_id} on ${date}`);

            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Timesheet created successfully'
            });

        } catch (error) {
            console.error('❌ Error creating timesheet:', error);
            
            if (error.code === '23505') { // Unique violation
                return res.status(409).json({
                    success: false,
                    message: 'Timesheet already exists for this date'
                });
            }
            
            if (error.code === '23503') { // Foreign key violation
                return res.status(400).json({
                    success: false,
                    message: 'Invalid employee_id or project_id'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create timesheet',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // POST /api/timesheets/:id/submit - Submit timesheet for approval
    router.post('/:id/submit', async (req, res) => {
        try {
            const timesheetId = req.params.id;
            const currentUser = req.session?.user;

            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            console.log('🔍 Submitting timesheet ID:', timesheetId);
            console.log('🔍 Current user:', currentUser.role);

            // Get the timesheet first
            const timesheetResult = await pool.query(
                'SELECT * FROM timesheets WHERE id = $1',
                [timesheetId]
            );

            if (timesheetResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Timesheet not found'
                });
            }

            const timesheet = timesheetResult.rows[0];
            const userEmployeeId = currentUser.employeeId || currentUser.employee_id || currentUser.id;

            // Check if user owns this timesheet or is admin
            const userIsAdmin = isAdmin({ session: { user: currentUser } });
            if (!userIsAdmin && timesheet.employee_id !== userEmployeeId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only submit your own timesheets'
                });
            }

            // Check if timesheet can be submitted
            if (timesheet.status !== 'draft') {
                return res.status(400).json({
                    success: false,
                    message: `Cannot submit timesheet with status: ${timesheet.status}`
                });
            }

            // Update timesheet status to submitted
            const result = await pool.query(
                `UPDATE timesheets 
                 SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1 
                 RETURNING *`,
                [timesheetId]
            );

            console.log('✅ Timesheet submitted successfully');

            res.json({
                success: true,
                data: result.rows[0],
                message: 'Timesheet submitted for approval'
            });

        } catch (error) {
            console.error('❌ Error submitting timesheet:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit timesheet',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    return router;
};

export default timesheetRoutes;