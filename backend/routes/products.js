
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/products'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const productsRoutes = (pool) => {
  const router = express.Router();

  // PUT archive product (set status to 'archived')
  router.put('/:id/archive', async (req, res) => {
    const { id } = req.params;
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(
        `UPDATE products SET status = 'archived', updated_at = NOW() WHERE product_id = $1 RETURNING *`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, message: 'Product archived', data: result.rows[0] });
    } catch (error) {
      console.error('❌ Error archiving product:', error);
      res.status(500).json({ success: false, message: 'Failed to archive product', error: error.message });
    } finally {
      if (client) client.release();
    }
  });

  // PUT restore product (set status to 'active')
  router.put('/:id/restore', async (req, res) => {
    const { id } = req.params;
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(
        `UPDATE products SET status = 'active', updated_at = NOW() WHERE product_id = $1 RETURNING *`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, message: 'Product restored', data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to restore product', error: error.message });
    } finally {
      if (client) client.release();
    }
  });

  // ...existing code...

  // ...existing code...

  // GET all products
  router.get('/', async (req, res) => {
    console.log('🔍 GET /api/products called');
    let client;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM products ORDER BY created_at DESC');
      console.log(`✅ Found ${result.rows.length} products`);
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
        data: [] // Always return empty array as fallback
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  // GET all products - Alternative endpoint for /api/products/all
  router.get('/all', async (req, res) => {
    console.log('🔍 GET /api/products/all called');
    let client;
    const { status } = req.query;
    try {
      client = await pool.connect();
      let query = 'SELECT * FROM products';
      let params = [];
      if (status === 'active' || status === 'archived') {
        query += ' WHERE status = $1';
        params.push(status);
      }
      query += ' ORDER BY created_at DESC';
      const result = await client.query(query, params);
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
        data: []
      });
    } finally {
      if (client) client.release();
    }
  });

  // GET single product - FIXED: Use 'id' instead of 'product_id'
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('🔍 GET single product called for ID:', id);
    let client;
    
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM products WHERE product_id = $1', [id]);
      
      if (result.rows.length === 0) {
        console.log('❌ Product not found with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      console.log('✅ Product found:', result.rows[0].product_name);
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  // POST new product
  router.post('/', upload.single('image'), async (req, res) => {
    console.log('🔍 POST new product called:', req.body);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Parse fields from FormData
      const product_name = req.body.product_name;
      const category = req.body.category;
      const cost_of_production = req.body.cost_of_production || 0;
      const selling_price = req.body.selling_price || 0;
      const quantity = req.body.quantity || 0;
      
      // Generate product ID
      const productId = uuidv4();
      
      // Handle image upload
      let image_path = null;
      if (req.file) {
        image_path = '/images/products/' + req.file.filename;
      }

      // Basic validation
      if (!product_name || !category) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Product name and category are required'
        });
      }

      const result = await client.query(
        `INSERT INTO products (product_id, product_name, category, cost_of_production, selling_price, quantity, image_path, created_at, updated_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), 'active') RETURNING *`,
        [productId, product_name, category, cost_of_production, selling_price, quantity, image_path]
      );

      await client.query('COMMIT');

      console.log('✅ Product created successfully:', result.rows[0].product_id);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message
      });
    } finally {
      client.release();
    }
  });

  // POST new product (for /add endpoint to match frontend)
  router.post('/add', upload.single('image'), async (req, res) => {
    console.log('🔍 POST /add new product called:', req.body);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const {
        product_name,
        quantity = 0,
        selling_price,
        category,
        cost_of_production = 0,
        materials // ✅ Extract materials from request
      } = req.body;

      console.log('📦 Creating product with materials:', materials ? JSON.parse(materials) : 'No materials');

      // Validate required fields
      if (!product_name || !selling_price || !category) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Product name, selling price, and category are required'
        });
      }

      // Generate product ID
      const productId = uuidv4();
      
      // Handle image path
      let imagePath = null;
      if (req.file) {
        imagePath = `/images/products/${req.file.filename}`;
      }

      // Insert product
      const productQuery = `
        INSERT INTO products (product_id, product_name, quantity, selling_price, category, cost_of_production, image_path, created_at, updated_at, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), 'active')
        RETURNING *;
      `;

      const productResult = await client.query(productQuery, [
        productId,
        product_name,
        parseInt(quantity),
        parseFloat(selling_price),
        category,
        parseFloat(cost_of_production),
        imagePath
      ]);

      console.log('✅ Product created:', productResult.rows[0]);

      // ✅ FIX: Store materials in product_materials table
      if (materials) {
        try {
          const materialsArray = JSON.parse(materials);
          console.log('📦 Processing materials:', materialsArray);

          if (Array.isArray(materialsArray) && materialsArray.length > 0) {
            for (const material of materialsArray) {
              if (material.material_id && material.measurement) {
                // Generate a unique UUID for each material record
                const materialRecordId = uuidv4();
                
                // Get current unit price from materials table for accuracy
                const materialQuery = await client.query(
                  'SELECT unit_price, unit FROM materials WHERE material_id = $1',
                  [material.material_id]
                );

                const currentUnitPrice = materialQuery.rows[0]?.unit_price || material.unit_price || 0;
                const currentUnit = materialQuery.rows[0]?.unit || material.unit;

                const materialInsert = `
                  INSERT INTO product_materials (production_id, product_id, material_id, measurement, unit)
                  VALUES ($1, $2, $3, $4, $5)
                `;

                await client.query(materialInsert, [
                  materialRecordId, // Use unique UUID for each material record
                  productId,
                  material.material_id,
                  parseFloat(material.measurement),
                  currentUnit
                ]);

                console.log(`✅ Material stored: ${material.material_id} - ${material.measurement} ${currentUnit}`);
              }
            }
          }
        } catch (materialError) {
          console.error('❌ Error processing materials:', materialError);
          // Don't rollback the entire transaction for material errors
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: productResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product: ' + error.message
      });
    } finally {
      client.release();
    }
  });

  // PUT update product - supports FormData and file upload
  router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    console.log('🔍 PUT update product called for ID:', id);
    let client;
    try {
      client = await pool.connect();
      // Parse fields from FormData
      const product_name = req.body.product_name;
      const category = req.body.category;
      const cost_of_production = req.body.cost_of_production || 0;
      const selling_price = req.body.selling_price || 0;
      const quantity = req.body.quantity || 0;
      // Handle image upload
      let image_path = req.body.image_path || null;
      if (req.file) {
        image_path = '/images/products/' + req.file.filename;
      }

      // Basic validation
      if (!product_name || !category) {
        return res.status(400).json({
          success: false,
          message: 'Product name and category are required'
        });
      }

      // Build dynamic update query
      let updateFields = [];
      let params = [];
      let paramIndex = 1;

      if (product_name !== undefined) {
        updateFields.push(`product_name = $${paramIndex++}`);
        params.push(product_name);
      }
      if (category !== undefined) {
        updateFields.push(`category = $${paramIndex++}`);
        params.push(category);
      }
      if (cost_of_production !== undefined) {
        updateFields.push(`cost_of_production = $${paramIndex++}`);
        params.push(cost_of_production);
      }
      if (selling_price !== undefined) {
        updateFields.push(`selling_price = $${paramIndex++}`);
        params.push(selling_price);
      }
      if (quantity !== undefined) {
        updateFields.push(`quantity = $${paramIndex++}`);
        params.push(quantity);
      }
      if (image_path !== undefined) {
        updateFields.push(`image_path = $${paramIndex++}`);
        params.push(image_path);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      // Add updated_at and id parameter
      updateFields.push('updated_at = NOW()');
      params.push(id);

      const query = `UPDATE products SET ${updateFields.join(', ')} WHERE product_id = $${paramIndex} RETURNING *`;
      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        console.log('❌ Product not found for update with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      console.log('✅ Product updated successfully:', id);
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  // Add this new endpoint to your existing products routes

// GET product materials with material details
router.get('/:productId/materials', async (req, res) => {
  let client;
  try {
    const { productId } = req.params;
    
    console.log('🔍 Fetching materials for product:', productId);

    client = await pool.connect();

    // Simple query - get all materials for this product
    let query = `
      SELECT 
        pm.production_id,
        pm.product_id,
        pm.material_id,
        pm.measurement,
        pm.unit,
        m.material_name,
        m.unit_price,
        m.category as material_category
      FROM product_materials pm
      JOIN materials m ON pm.material_id = m.material_id
      WHERE pm.product_id = $1 AND m.status = 'active'
      ORDER BY m.material_name
    `;

    let result = await client.query(query, [productId]);

    console.log(`✅ Found ${result.rows.length} materials for product ${productId}`);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error fetching product materials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product materials: ' + error.message,
      data: []
    });
  } finally {
    if (client) client.release();
  }
});

  // DELETE product - FIXED: Use 'id' instead of 'product_id'
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('🔍 DELETE product called for ID:', id);
    let client;
    
    try {
      client = await pool.connect();
      
      // Check if product exists first
      const checkResult = await client.query('SELECT product_id, product_name FROM products WHERE product_id = $1', [id]);
      
      if (checkResult.rows.length === 0) {
        console.log('❌ Product not found for deletion with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const productName = checkResult.rows[0].product_name;

      // Delete the product
      const result = await client.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [id]);

      console.log('✅ Product deleted successfully:', id);
      res.json({
        success: true,
        message: `Product "${productName}" deleted successfully`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  return router;
};

export default productsRoutes;