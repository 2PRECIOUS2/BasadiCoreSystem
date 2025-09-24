const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // create employee
router.post('/', async (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    dateOfBirth,
    email,
    cellNo,
    emergencyContact,
    street,
    province,
    city,
    postalCode,
    role,
    hourlyRate,
    employmentType,
    employmentStatus
  } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO employees 
        (first_name, last_name, gender, date_of_birth, email, cell_no, emergency_contact, street, province, city, postal_code, role, hourly_rate, employment_type, employment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        firstName,
        lastName,
        gender,
        dateOfBirth,
        email,
        cellNo,
        emergencyContact,
        street,
        province,
        city,
        postalCode,
        role,
        hourlyRate,
        employmentType,
        employmentStatus || 'active'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505' && err.detail && err.detail.includes('email')) {
      res.status(400).json({ error: "An employee with this email already exists." });
    } else {
      res.status(500).json({ error: "Failed to create employee" });
    }
  } finally {
    client.release();
  }
});

router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT employee_id, first_name, last_name, gender, date_of_birth, email, cell_no, emergency_contact, street, province, city, postal_code, role, hourly_rate, employment_type, employment_status, hired_date
       FROM employees
       ORDER BY employee_id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employees" });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const {
    email,
    cellNo,
    emergencyContact,
    street,
    province,
    city,
    postalCode,
    hourlyRate
  } = req.body;
  const { id } = req.params;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE employees
       SET email = $1,
           cell_no = $2,
           emergency_contact = $3,
           street = $4,
           province = $5,
           city = $6,
           postal_code = $7,
           hourly_rate = $8
       WHERE employee_id = $9
       RETURNING *`,
      [
        email,
        cellNo,
        emergencyContact,
        street,
        province,
        city,
        postalCode,
        hourlyRate,
        id
      ]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Employee not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update employee" });
  } finally {
    client.release();
  }
});

// Get employee project stats
router.get('/:id/project-stats', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    // Per-project work percentage
    const perProject = await client.query(
      `
      SELECT 
        p.project_id,
        p.project_name,
        COUNT(pt.task_id) FILTER (WHERE pt.completed = true) * 100.0 / NULLIF(COUNT(pt.task_id),0) AS work_percentage
      FROM projects p
      JOIN project_tasks pt ON pt.project_id = p.project_id
      WHERE pt.staff_id = $1
      GROUP BY p.project_id, p.project_name
      ORDER BY p.project_id
      `,
      [id]
    );

    // Average project score
    const avgScore = await client.query(
      `
      WITH work_per_project AS (
        SELECT 
          p.project_id,
          COUNT(pt.task_id) FILTER (WHERE pt.completed = true) * 100.0 / NULLIF(COUNT(pt.task_id),0) AS work_percentage
        FROM projects p
        JOIN project_tasks pt ON pt.project_id = p.project_id
        WHERE pt.staff_id = $1
        GROUP BY p.project_id
      )
      SELECT ROUND(AVG(work_percentage)) AS project_score FROM work_per_project
      `,
      [id]
    );

    res.json({
      projects: perProject.rows.map(row => ({
        project_id: row.project_id,
        project_name: row.project_name,
        work_percentage: Number(row.work_percentage) || 0
      })),
      project_score: avgScore.rows[0]?.project_score || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch project stats" });
  } finally {
    client.release();
  }
});

router.put('/:id/archive', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    // Check for active tasks
    const activeTasks = await client.query(
      `SELECT COUNT(*) FROM project_tasks WHERE staff_id = $1 AND completed = false`,
      [id]
    );
    if (Number(activeTasks.rows[0].count) > 0) {
      return res.status(400).json({ error: "Employee has active tasks and cannot be archived." });
    }

    // Archive employee
    const result = await client.query(
      `UPDATE employees SET employment_status = 'archived' WHERE employee_id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to archive employee" });
  } finally {
    client.release();
  }
});


router.put('/:id/restore', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE employees SET employment_status = 'active' WHERE employee_id = $1 AND employment_status = 'archived' RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Archived employee not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to restore employee" });
  } finally {
    client.release();
  }
});

    return router;
};