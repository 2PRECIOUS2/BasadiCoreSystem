const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const fs = require('fs');
const sharp = require('sharp');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/images/materials'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = (pool) => {

  // Add new batch for a material
  router.post('/add-material-stock', async (req, res) => {
    const { material_id, supplier_name, quantity, price_bought, unit_price, purchase_date } = req.body;
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // 1. Get next batch number for this material
      const batchNumResult = await client.query(
        `SELECT COALESCE(MAX(batch_number), 0) + 1 AS next_batch_number
         FROM material_stock_items
         WHERE material_id = $1`,
        [material_id]
      );
      const nextBatchNumber = batchNumResult.rows[0].next_batch_number;

      // 2. Insert new batch
      await client.query(
        `INSERT INTO material_stock_items (
          material_id, supplier_name, quantity, price_bought, unit_price, created_at, batch_number, batch_status, purchase_date
        ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, 'active', $7)`,
        [material_id, supplier_name, quantity, price_bought, unit_price, nextBatchNumber, purchase_date]
      );

      // 3. Update materials table quantity to sum of active batches
      const totalQtyResult = await client.query(
        `SELECT SUM(quantity) AS total_quantity
         FROM material_stock_items
         WHERE material_id = $1 AND batch_status = 'active'`,
        [material_id]
      );
      const totalQuantity = totalQtyResult.rows[0].total_quantity || 0;
      await client.query(
        `UPDATE materials SET quantity = $1 WHERE material_id = $2`,
        [totalQuantity, material_id]
      );

      await client.query('COMMIT');
      res.status(201).json({ success: true, message: 'Material batch added successfully.' });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ success: false, message: 'Failed to add material batch', error: error.message });
    } finally {
      if (client) client.release();
    }
  });
  // Add Material
  router.post('/add', upload.single('image'), async (req, res) => {
    const { material_name, unit, category } = req.body;
    const sku_code = Math.random().toString(36).substr(2, 8).toUpperCase();
    const image_path = req.file ? req.file.filename : null;
    
    if (req.file) {
      const imagePath = path.join(__dirname, '../../public/images/materials', req.file.filename);
      await sharp(imagePath)
        .resize(300, 300)
        .toFile(imagePath + '_tmp');
      fs.renameSync(imagePath + '_tmp', imagePath);
    }

    let client;
    try {
      client = await pool.connect();
      const result = await client.query(
        `INSERT INTO materials (material_name, sku_code, unit, category, quantity, created_at, updated_at, unit_price, image_path, status)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), 0, $6, 'active') RETURNING *`,
        [material_name, sku_code, unit, category, 0, image_path]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error adding material:', err.message);
      res.status(500).json({ message: 'Error adding material' });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  // Get all materials (UNIFIED - with status filtering)
  router.get('/all', async (req, res) => {
    const { status, search, category, unit, quantity } = req.query;
    let client;
    
    try {
      client = await pool.connect();
      let query = `SELECT * FROM materials WHERE 1=1`;
      const params = [];
      let idx = 1;

      // Status filter - if no status specified, default to active only
      if (status) {
        query += ` AND status = $${idx++}`;
        params.push(status);
      } else {
        query += ` AND status = $${idx++}`;
        params.push('active');
      }

      // Other filters
      if (unit) {
        query += ` AND unit = $${idx++}`;
        params.push(unit);
      }
      if (category) {
        query += ` AND category = $${idx++}`;
        params.push(category);
      }
      if (quantity) {
        query += ` AND quantity = $${idx++}`;
        params.push(Number(quantity));
      }
      if (search) {
        query += ` AND (LOWER(material_name) LIKE $${idx} OR LOWER(sku_code) LIKE $${idx})`;
        params.push(`%${search.toLowerCase()}%`);
        idx++;
      }
      
      query += ` ORDER BY created_at DESC`;

      console.log('Materials query:', query, 'Params:', params);
      const result = await client.query(query, params);
      console.log(`Found ${result.rows.length} materials`);
      
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching materials:', err.message);
      res.status(500).json({ message: 'Error fetching materials' });
    } finally {
      if (client) client.release();
    }
  });

  // Update Material
  router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    let { material_name, category, unit } = req.body;
    const image_path = req.file ? req.file.filename : null;

    if (req.file) {
      const imagePath = path.join(__dirname, '../../public/images/materials', req.file.filename);
      await sharp(imagePath)
        .resize(300, 300)
        .toFile(imagePath + '_tmp');
      fs.renameSync(imagePath + '_tmp', imagePath);
    }

    let client;
    try {
      client = await pool.connect();

      const existing = await client.query('SELECT * FROM materials WHERE material_id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ message: 'Material not found' });
      }
      const current = existing.rows[0];

      material_name = material_name ?? current.material_name;
      category = category ?? current.category;
      unit = unit ?? current.unit;

      let query = `UPDATE materials SET material_name = $1, category = $2, unit = $3, updated_at = NOW()`;
      const params = [material_name, category, unit];
      let idx = 4;

      if (image_path) {
        query += `, image_path = $${idx++}`;
        params.push(image_path);
      }
      query += ` WHERE material_id = $${idx} RETURNING *`;
      params.push(id);

      const result = await client.query(query, params);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating material:', err.message);
      res.status(500).json({ message: 'Error updating material' });
    } finally {
      if (client) client.release();
    }
  });

  // Archive material endpoint (UNIFIED)
  router.put('/:id/archive', async (req, res) => {
    const { id } = req.params;
    let client;
    
    console.log('Archive endpoint called for material ID:', id);
    
    try {
      client = await pool.connect();
      
      const result = await client.query(
        'UPDATE materials SET status = $1, updated_at = NOW() WHERE material_id = $2 RETURNING *',
        ['inactive', id]
      );

      if (result.rows.length === 0) {
        console.log('Material not found with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Material not found'
        });
      }

      console.log('Material archived successfully:', result.rows[0]);
      res.json({
        success: true,
        message: 'Material archived successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error archiving material:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to archive material',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });

  // Restore material endpoint
  router.put('/:id/restore', async (req, res) => {
    const { id } = req.params;
    let client;
    
    console.log('Restore endpoint called for material ID:', id);
    
    try {
      client = await pool.connect();
      
      const result = await client.query(
        'UPDATE materials SET status = $1, updated_at = NOW() WHERE material_id = $2 RETURNING *',
        ['active', id]
      );

      if (result.rows.length === 0) {
        console.log('Material not found with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Material not found'
        });
      }

      console.log('Material restored successfully:', result.rows[0]);
      res.json({
        success: true,
        message: 'Material restored successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error restoring material:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restore material',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });

  return router;
};