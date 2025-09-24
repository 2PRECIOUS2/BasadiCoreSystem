const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Create a new project with tasks
  router.post('/', async (req, res) => {
    const {
      projectName,
      category,
      startDate,
      deadline,
      location,
      partner,
      staff, // array of staff IDs
      additionalNotes,
      status,
      tasks // array of { name, staffId, taskDeadline, completed }
    } = req.body;

    const categoryImageMap = {
      training: "TrainingProgram.png",
      handicraft: "handcraftingPrograms.png",
      product: "ProductLaunching.png",
      speaker: "SpeakerPrograms.png"
    };
    const imageFile = categoryImageMap[category] || null;
    const imagePath = imageFile ? `/images/Projectcategory/${imageFile}` : null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const projectResult = await client.query(
        `INSERT INTO projects 
          (project_name, category, start_date, deadline, location, partner, staff, additional_notes, status, image_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING project_id`,
        [
          projectName,
          category,
          startDate,
          deadline,
          location,
          partner || null,
          staff || null,
          additionalNotes || null,
          status || 'active',
          imagePath
        ]
      );
      const projectId = projectResult.rows[0].project_id;

      if (Array.isArray(tasks) && tasks.length > 0) {
        for (const t of tasks) {
          await client.query(
            `INSERT INTO project_tasks (task, staff_id, task_deadline, project_id, completed)
             VALUES ($1, $2, $3, $4, $5)`,
            [t.name, t.staffId, t.taskDeadline, projectId, t.completed || false]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json({ message: "Project created successfully", projectId });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: "Failed to create project" });
    } finally {
      client.release();
    }
  });

  // Active employees
  router.get('/employees', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT employee_id, first_name, last_name, email FROM employees WHERE employment_status = 'active'`
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  // All projects (summary view)
  router.get('/', async (req, res) => {
    const client = await pool.connect();
    try {
      const projectsResult = await client.query(`
        SELECT 
          p.project_id,
          p.project_name,
          p.category,
          p.start_date,
          p.deadline,
          p.location,
          p.partner,
          p.additional_notes,
          p.status,
          p.image_path
        FROM projects p
        ORDER BY p.deadline ASC
      `);

      const projects = [];
      for (const row of projectsResult.rows) {
        const tasksResult = await client.query(
          `SELECT completed FROM project_tasks WHERE project_id = $1`,
          [row.project_id]
        );
        const totalTasks = tasksResult.rowCount;
        const completedTasks = tasksResult.rows.filter(t => t.completed).length;

        let status = "In Progress";
        if (totalTasks === 0) status = "Not Started";
        else if (completedTasks === totalTasks) status = "Completed";

        projects.push({
          id: row.project_id,
          title: row.project_name,
          category: row.category,
          startDate: row.start_date,
          deadline: row.deadline,
          location: row.location,
          partner: row.partner,
          notes: row.additional_notes,
          status,
          image: row.image_path,
          completedTasks,
          totalTasks,
          tasks: [] // Placeholder for tasks if needed
        });
      }

      res.json(projects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch projects" });
    } finally {
      client.release();
    }
  });

// Single project with tasks - FIXED SQL QUERY
router.get('/:id', async (req, res) => {
  const projectId = req.params.id;
  try {
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE project_id = $1',
      [projectId]
    );
    console.log("Fetched projectResult:", projectResult.rows);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    const p = projectResult.rows[0];

    const tasksResult = await pool.query(
      `SELECT t.task_id, t.task, t.staff_id, t.task_deadline, t.completed,
              e.first_name, e.last_name, e.role
         FROM project_tasks t
         LEFT JOIN employees e ON t.staff_id = e.employee_id
        WHERE t.project_id = $1
        ORDER BY t.task_deadline ASC`,
      [projectId]
    );

    // Get orders data for this project
    const ordersResult = await pool.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(totalamount), 0) as total_spent
       FROM orders 
       WHERE project_id = $1 AND orderstatus != 'cancelled'`,
      [projectId]
    );

    // FIXED: Get detailed orders for this project with proper table aliases
    const orderDetailsResult = await pool.query(
      `SELECT 
        o.orderno,
        CASE 
          WHEN o.order_type = 'project' THEN COALESCE(o.cust_fname || ' ' || o.cust_lname, 'Unknown')
          ELSE COALESCE(c.cust_fname || ' ' || c.cust_lname, 'Unknown')
        END AS customer_name,
        o.totalamount,
        o.orderstatus,
        o.deliverydate,
        o.createdat
       FROM orders o
       LEFT JOIN customers c ON o.customerid = c.cust_id
       WHERE o.project_id = $1
       ORDER BY o.createdat DESC`,
      [projectId]
    );

    console.log("Fetched tasksResult:", tasksResult.rows);
    console.log("Fetched ordersResult:", ordersResult.rows);
    
    // Format tasks properly for frontend
    const tasks = tasksResult.rows.map(t => ({
      id: t.task_id,
      name: t.task,
      staffId: t.staff_id,
      taskDeadline: t.task_deadline,
      completed: t.completed,
      firstName: t.first_name,
      lastName: t.last_name,
      staffInitials: t.first_name && t.last_name
        ? `${t.first_name[0]}${t.last_name[0]}`.toUpperCase()
        : "",
      role: t.role || "staff"
    }));

    // Format orders data
    const ordersData = ordersResult.rows[0];
    const ordersList = orderDetailsResult.rows.map(order => ({
      orderno: order.orderno,
      customer: order.customer_name,
      amount: Number(order.totalamount),
      status: order.orderstatus,
      deliveryDate: order.deliverydate,
      createdAt: order.createdat
    }));
    
    const project = {
      id: p.project_id,
      title: p.project_name,
      category: p.category,
      startDate: p.start_date,
      deadline: p.deadline,
      location: p.location,
      partner: p.partner,
      notes: p.additional_notes,
      status: p.status,
      image: p.image_path,
      tasks,
      totalOrders: Number(ordersData.total_orders),
      totalSpent: Number(ordersData.total_spent),
      ordersList: ordersList
    };
    
    console.log("Final project sent to frontend:", project);
    res.json(project);
  } catch (err) {
    console.error('Error in project route:', err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

  // Update project
  router.put('/:id', async (req, res) => {
    const { startDate, deadline, location, partner, additionalNotes, tasks } = req.body;
    const projectId = req.params.id;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE projects 
         SET start_date=$1, deadline=$2, location=$3, partner=$4, additional_notes=$5 
         WHERE project_id=$6`,
        [startDate, deadline, location, partner, additionalNotes, projectId]
      );

      await client.query(`DELETE FROM project_tasks WHERE project_id=$1`, [projectId]);

      if (Array.isArray(tasks) && tasks.length > 0) {
        for (const t of tasks) {
          await client.query(
            `INSERT INTO project_tasks (task, staff_id, task_deadline, project_id, completed)
             VALUES ($1, $2, $3, $4, $5)`,
            [t.name, t.staffId, t.taskDeadline, projectId, t.completed || false]
          );
        }
      }

      await client.query('COMMIT');
      res.json({ message: "Project updated successfully" });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: "Failed to update project" });
    } finally {
      client.release();
    }
  });

  // Mark task complete
  router.put('/tasks/:taskId/completed', async (req, res) => {
    const { taskId } = req.params;
    const { completed } = req.body;
    try {
      await pool.query(
        'UPDATE project_tasks SET completed = $1 WHERE task_id = $2',
        [completed, taskId]
      );
      res.json({ message: "Task updated" });
    } catch (err) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  return router;
};