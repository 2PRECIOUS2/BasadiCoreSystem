const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET all products
  router.get('/', async (req, res) => {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM products ORDER BY created_at DESC');
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  // GET single product - Make sure parameter name is correct
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    let client;
    
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM products WHERE product_id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product'
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  // POST new product
  router.post('/', async (req, res) => {
    let client;
    try {
      client = await pool.connect();
      // Your product creation logic here
      res.json({
        success: true,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  // PUT update product - Make sure parameter name is correct
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    let client;
    
    try {
      client = await pool.connect();
      // Your product update logic here
      res.json({
        success: true,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product'
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  // DELETE product - Make sure parameter name is correct
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    let client;
    
    try {
      client = await pool.connect();
      // Your product deletion logic here
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  return router;
};