const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('../db'); // adjust path if needed

const upload = multer({ dest: 'public/images/products' });

router.post('/add', upload.single('image'), async (req, res) => {
  const { product_name, category, cost_of_production, selling_price } = req.body;
  let materials;
  try {
    materials = JSON.parse(req.body.materials);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid materials data' });
  }
  const image_path = req.file ? req.file.filename : null;

  let client;
  try {
    client = await db.pool.connect();
    // Insert product
    const productId = uuidv4();
    await client.query(
      `INSERT INTO products (id, product_name, category, cost_of_production, selling_price, image_path)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [productId, product_name, category, cost_of_production, selling_price, image_path]
    );

    // Insert product_materials
    for (const mat of materials) {
      await client.query(
        `INSERT INTO product_materials (id, product_id, material_id, measurement)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), productId, mat.materialId, mat.measurement]
      );
    }

    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  } finally {
    if (client) client.release();
  }
});

// Get all products (with optional quantity aggregation)
router.get('/all', async (req, res) => {
  let client;
  try {
    client = await db.pool.connect();
    // If you want to include total quantity from product_materials, join/aggregate as needed
    const result = await client.query(`
      SELECT 
        p.id, 
        p.product_name, 
        p.category, 
        p.selling_price, 
        p.image_path,
        p.quantity
      FROM products p
      ORDER BY p.product_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
