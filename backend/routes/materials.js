// backend/routes/materials.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const fs = require('fs'); // <-- Add this
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

// This module now EXPORTS A FUNCTION that takes the 'pool' object as an argument.
// This is how Server.js will pass the shared database connection to this route file.
module.exports = (pool) => { // <--- ADD THIS WRAPPER FUNCTION

  // Add Material
   router.post('/add', upload.single('image'), async (req, res) => {
    const { material_name, unit, category } = req.body;
    const sku_code = Math.random().toString(36).substr(2, 8).toUpperCase();
    const image_path = req.file ? req.file.filename : null;
    if (req.file) {
  const imagePath = path.join(__dirname, '../../public/images/materials', req.file.filename);
  // Resize to 300x300px and overwrite the original
  await sharp(imagePath)
    .resize(300, 300)
    .toFile(imagePath + '_tmp');
  // Replace original with resized
  fs.renameSync(imagePath + '_tmp', imagePath);
}

    let client; // Declare client here for proper connection management
    try {
      client = await pool.connect(); // Get a client from the pool
      const result = await client.query(
        `INSERT INTO materials (material_name, sku_code, unit, category, quantity, created_at, updated_at, unit_price, image_path)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), 0, $6) RETURNING *`, // Added created_at and updated_at
        [material_name, sku_code, unit, category, 0, image_path]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error adding material:', err.message);
      res.status(500).json({ message: 'Error adding material' });
    } finally {
      if (client) {
        client.release(); // Release the client back to the pool
      }
    }
  });

 // Get all materials (with optional filters)
router.get('/all', async (req, res) => {
  const { unit, category, quantity, search } = req.query;
  let client;
  try {
    client = await pool.connect();
    let query = `SELECT * FROM materials WHERE 1=1`;
    const params = [];
    let idx = 1;

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

    const result = await client.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching materials:', err.message);
    res.status(500).json({ message: 'Error fetching materials' });
  } finally {
    if (client) client.release();
  }
}); 

// Update Material (with optional image upload)
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

    // Fetch existing material
    const existing = await client.query('SELECT * FROM materials WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Material not found' });
    }
    const current = existing.rows[0];

    // Use existing values if not provided
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
    query += ` WHERE id = $${idx} RETURNING *`;
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

// backend/routes/materials.js
router.put('/:id/archive', async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await pool.connect();
    await client.query('UPDATE materials SET archived = TRUE, updated_at = NOW() WHERE id = $1', [id]);
    res.json({ message: 'Material archived' });
  } catch (err) {
    res.status(500).json({ message: 'Error archiving material' });
  } finally {
    if (client) client.release();
  }
});


  return router; // <--- IMPORTANT: Return the configured router instance
}; // <--- CLOSE THE WRAPPER FUNCTION