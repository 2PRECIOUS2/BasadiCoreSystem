import 'dotenv/config';
import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// GET /api/dashboard/sales-report - Sales data by product/category
router.get('/sales-report', async (req, res) => {
  try {
    console.log('Fetching sales report data...');
    
    const salesData = await pool.query(`
      SELECT 
        p.product_name,
        p.category,
        COUNT(o.orderno) as order_count,
        SUM(o.totalamount) as total_sales,
        AVG(o.totalamount) as avg_order_value
      FROM orders o
      JOIN products p ON o.product_id = p.product_id
      WHERE o.orderstatus = 'completed'
      GROUP BY p.product_id, p.product_name, p.category
      ORDER BY total_sales DESC
      LIMIT 10
    `);

    res.json(salesData.rows);
  } catch (err) {
    console.error('Error fetching sales report:', err);
    res.status(500).json({ error: 'Failed to fetch sales report' });
  }
});

// GET /api/dashboard/customer-report - Customer analytics
router.get('/customer-report', async (req, res) => {
  try {
    console.log('Fetching customer report data...');
    
    const customerData = await pool.query(`
      SELECT 
        c.cust_fname || ' ' || c.cust_lname as customer_name,
        COUNT(o.orderno) as total_orders,
        SUM(o.totalamount) as total_spent,
        AVG(o.totalamount) as avg_order_value,
        c.cust_status as status
      FROM customers c
      LEFT JOIN orders o ON c.cust_id = o.customerid
      GROUP BY c.cust_id, c.cust_fname, c.cust_lname, c.cust_status
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    res.json(customerData.rows);
  } catch (err) {
    console.error('Error fetching customer report:', err);
    res.status(500).json({ error: 'Failed to fetch customer report' });
  }
});

// GET /api/dashboard/customer-orders - Customer order analytics
router.get('/customer-orders', async (req, res) => {
  try {
    console.log('Fetching customer order data...');
    
    const orderData = await pool.query(`
      SELECT 
        o.orderstatus as status,
        COUNT(*) as count,
        SUM(o.totalamount) as total_value
      FROM orders o
      GROUP BY o.orderstatus
      ORDER BY count DESC
    `);

    res.json(orderData.rows);
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// GET /api/dashboard/material-report - Material usage analytics
router.get('/material-report', async (req, res) => {
  try {
    console.log('Fetching material report data...');
    
    const materialData = await pool.query(`
      SELECT 
        m.material_name,
        m.category,
        m.quantity as current_stock,
        m.unit_price,
        CASE 
          WHEN m.quantity < 10 THEN 'Low Stock'
          WHEN m.quantity < 50 THEN 'Medium Stock'
          ELSE 'High Stock'
        END as stock_level
      FROM materials m
      WHERE m.status = 'active'
      ORDER BY m.quantity ASC
      LIMIT 15
    `);

    res.json(materialData.rows);
  } catch (err) {
    console.error('Error fetching material report:', err);
    res.status(500).json({ error: 'Failed to fetch material report' });
  }
});

// GET /api/dashboard/product-orders - Product order analytics
router.get('/product-orders', async (req, res) => {
  try {
    console.log('Fetching product order data...');
    
    const productOrderData = await pool.query(`
      SELECT 
        p.product_name,
        p.category,
        COUNT(o.orderno) as order_count,
        SUM(o.totalamount) as total_revenue,
        p.selling_price,
        p.quantity as stock_quantity
      FROM products p
      LEFT JOIN orders o ON p.product_id = o.product_id
      WHERE p.status = 'active'
      GROUP BY p.product_id, p.product_name, p.category, p.selling_price, p.quantity
      ORDER BY order_count DESC
      LIMIT 12
    `);

    res.json(productOrderData.rows);
  } catch (err) {
    console.error('Error fetching product orders:', err);
    res.status(500).json({ error: 'Failed to fetch product orders' });
  }
});

// GET /api/dashboard/analytics - Main analytics dashboard data
router.get('/analytics', async (req, res) => {
  try {
    console.log('Fetching analytics dashboard data...');
    
    // Get summary statistics
    const summaryStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE orderstatus = 'completed') as completed_orders,
        (SELECT COUNT(*) FROM orders WHERE orderstatus = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM customers WHERE cust_status = 'active') as active_customers,
        (SELECT COUNT(*) FROM products WHERE status = 'active') as active_products,
        (SELECT SUM(totalamount) FROM orders WHERE orderstatus = 'completed') as total_revenue
    `);

    // Get monthly sales trend
    const monthlySales = await pool.query(`
      SELECT 
        DATE_TRUNC('month', deliverydate) as month,
        COUNT(*) as orders,
        SUM(totalamount) as revenue
      FROM orders 
      WHERE orderstatus = 'completed' 
        AND deliverydate >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', deliverydate)
      ORDER BY month DESC
      LIMIT 12
    `);

    // Get top products
    const topProducts = await pool.query(`
      SELECT 
        p.product_name,
        COUNT(o.orderno) as order_count,
        SUM(o.totalamount) as revenue
      FROM products p
      LEFT JOIN orders o ON p.product_id = o.product_id
      WHERE o.orderstatus = 'completed'
      GROUP BY p.product_id, p.product_name
      ORDER BY revenue DESC
      LIMIT 5
    `);

    res.json({
      summary: summaryStats.rows[0],
      monthlySales: monthlySales.rows,
      topProducts: topProducts.rows
    });

  } catch (err) {
    console.error('Error fetching analytics data:', err);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// GET /api/dashboard/timesheet-analytics - Timesheet analytics
router.get('/timesheet-analytics', async (req, res) => {
  try {
    console.log('Fetching timesheet analytics...');
    
    const timesheetData = await pool.query(`
      SELECT 
        e.first_name || ' ' || e.last_name as employee_name,
        COUNT(t.id) as total_timesheets,
        SUM(t.total_hours) as total_hours,
        AVG(t.total_hours) as avg_hours_per_day,
        t.status
      FROM employees e
      LEFT JOIN timesheets t ON e.employee_id = t.employee_id
      WHERE t.date >= NOW() - INTERVAL '30 days'
      GROUP BY e.employee_id, e.first_name, e.last_name, t.status
      ORDER BY total_hours DESC
      LIMIT 10
    `);

    res.json(timesheetData.rows);
  } catch (err) {
    console.error('Error fetching timesheet analytics:', err);
    res.status(500).json({ error: 'Failed to fetch timesheet analytics' });
  }
});

return router;
};

export default dashboardRouter;