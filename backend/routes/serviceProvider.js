const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  
  // GET all service providers
  router.get('/', async (req, res) => {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM service_providers ORDER BY provider_name ASC'
      );
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Error fetching service providers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service providers',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });

  // POST new service provider
  router.post('/', async (req, res) => {
    const { name, location, contact_number, email } = req.body;
    let client;
    
    try {
      client = await pool.connect();
      const result = await client.query(
        `INSERT INTO service_providers (provider_name, provider_location, provider_number, provider_email, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [name, location, contact_number, email]
      );
      
      res.status(201).json({
        success: true,
        message: 'Service provider added successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error adding service provider:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add service provider',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });

  return router;
};