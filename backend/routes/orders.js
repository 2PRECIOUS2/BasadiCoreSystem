const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await db.query('SELECT * FROM orders');
    res.json(orders.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  const { customer_id, items } = req.body; // items: [{ product_id, quantity }]
  try {
    // Insert order
    const orderRes = await db.query(
      'INSERT INTO orders (customer_id, created_at) VALUES ($1, NOW()) RETURNING order_id',
      [customer_id]
    );
    const order_id = orderRes.rows[0].order_id;
    // Insert order items
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [order_id, item.product_id, item.quantity]
      );
    }
    res.status(201).json({ order_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
