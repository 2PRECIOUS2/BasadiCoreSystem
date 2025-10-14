import 'dotenv/config';
import express from 'express';

const router = express.Router();

const dashboardRouter = (pool) => {

// Analytics endpoint
router.get('/analytics', async (req, res) => {
  try {
    console.log('Fetching analytics data...');
    
    // Total orders
    const totalOrdersResult = await pool.query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = parseInt(totalOrdersResult.rows[0].count);

    // Total customers
    const totalCustomersResult = await pool.query('SELECT COUNT(*) as count FROM customers');
    const totalCustomers = parseInt(totalCustomersResult.rows[0].count);

    // Total products
    const totalProductsResult = await pool.query('SELECT COUNT(*) as count FROM products');
    const totalProducts = parseInt(totalProductsResult.rows[0].count);

    // Total materials
    const totalMaterialsResult = await pool.query('SELECT COUNT(*) as count FROM materials');
    const totalMaterials = parseInt(totalMaterialsResult.rows[0].count);

    // Revenue calculation (use correct column name)
    const revenueResult = await pool.query('SELECT SUM(totalamount) as revenue FROM orders WHERE orderstatus = $1', ['delivered']);
    const totalRevenue = parseFloat(revenueResult.rows[0].revenue || 0);

    // Recent orders with customer info
    const recentOrdersResult = await pool.query(`
      SELECT o.orderid, o.totalamount, o.orderstatus, o.createdat,
             o.cust_fname, o.cust_lname
      FROM orders o
      ORDER BY o.createdat DESC
      LIMIT 5
    `);

    const analytics = {
      totalOrders,
      totalCustomers, 
      totalProducts,
      totalMaterials,
      totalRevenue,
      recentOrders: recentOrdersResult.rows
    };

    console.log('Analytics data fetched successfully:', analytics);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data', details: error.message });
  }
});

// Sales report endpoint  
router.get('/sales-report', async (req, res) => {
  try {
    console.log('Fetching sales report data...');
    
    // Orders by status
    const ordersByStatusResult = await pool.query(`
      SELECT orderstatus, COUNT(*) as count
      FROM orders 
      GROUP BY orderstatus
      ORDER BY count DESC
    `);

    // Monthly sales (use correct date column)
    const monthlySalesResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', createdat) as month,
        SUM(totalamount) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE createdat >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', createdat)
      ORDER BY month
    `);

    // Top products by quantity sold
    const topProductsResult = await pool.query(`
      SELECT p.product_name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.unitprice) as revenue
      FROM orderitems oi
      JOIN products p ON oi.productid = p.product_id
      JOIN orders o ON oi.orderno = o.orderid
      WHERE o.orderstatus = 'delivered'
      GROUP BY p.product_id, p.product_name
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    const salesData = {
      ordersByStatus: ordersByStatusResult.rows,
      monthlySales: monthlySalesResult.rows.map(row => ({
        month: row.month.toISOString().slice(0, 7), // Format as YYYY-MM
        revenue: parseFloat(row.revenue || 0),
        orders: parseInt(row.orders)
      })),
      topProducts: topProductsResult.rows.map(row => ({
        productname: row.product_name,
        total_sold: parseInt(row.total_sold),
        revenue: parseFloat(row.revenue || 0)
      }))
    };

    console.log('Sales report data fetched successfully');
    res.json(salesData);
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ error: 'Failed to fetch sales report data', details: error.message });
  }
});

// Customer report endpoint
router.get('/customer-report', async (req, res) => {
  try {
    console.log('Fetching customer report data...');
    
    // Customer statistics
    const customerStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN createdat >= NOW() - INTERVAL '30 days' THEN 1 END) as new_customers
      FROM customers
    `);

    // Top customers by orders (use correct column names)
    const topCustomersResult = await pool.query(`
      SELECT o.cust_fname, o.cust_lname, 
             COUNT(o.orderid) as total_orders,
             COALESCE(SUM(o.totalamount), 0) as total_spent
      FROM orders o
      WHERE o.cust_fname IS NOT NULL
      GROUP BY o.cust_fname, o.cust_lname
      ORDER BY total_orders DESC
      LIMIT 10
    `);

    // Customer geographic distribution (extract city from delivery address JSON)
    const customerCitiesResult = await pool.query(`
      SELECT 
        CASE 
          WHEN o.deliveryaddress::jsonb->>'city' IS NOT NULL 
          THEN o.deliveryaddress::jsonb->>'city'
          ELSE 'Unknown'
        END as city,
        COUNT(*) as order_count
      FROM orders o
      WHERE o.deliveryaddress IS NOT NULL
      GROUP BY o.deliveryaddress::jsonb->>'city'
      ORDER BY order_count DESC
      LIMIT 10
    `);

    const customerData = {
      stats: customerStatsResult.rows[0],
      topCustomers: topCustomersResult.rows.map(row => ({
        name: `${row.cust_fname || ''} ${row.cust_lname || ''}`.trim(),
        email: 'N/A', // Email not available in orders table
        total_orders: parseInt(row.total_orders),
        total_spent: parseFloat(row.total_spent || 0)
      })),
      cities: customerCitiesResult.rows.map(row => ({
        city: row.city,
        order_count: parseInt(row.order_count)
      }))
    };

    console.log('Customer report data fetched successfully');
    res.json(customerData);
  } catch (error) {
    console.error('Error fetching customer report:', error);
    res.status(500).json({ error: 'Failed to fetch customer report data', details: error.message });
  }
});

// Material report endpoint
router.get('/material-report', async (req, res) => {
  try {
    console.log('Fetching material report data...');
    
    // Material statistics
    const materialStatsResult = await pool.query(`
      SELECT COUNT(*) as total_materials FROM materials
    `);

    // Material stock levels using your actual table structure
    const stockLevelsResult = await pool.query(`
      SELECT 
        m.material_name, 
        SUM(msi.quantity) as total_quantity,
        m.unit,
        COUNT(msi.id) as stock_entries,
        AVG(msi.unit_price) as avg_price
      FROM materials m
      LEFT JOIN material_stock_items msi ON m.material_id = msi.material_id
      WHERE msi.batch_status = 'active'
      GROUP BY m.material_id, m.material_name, m.unit
      ORDER BY total_quantity ASC
      LIMIT 15
    `);

    // Material purchase summary
    const materialPurchasesResult = await pool.query(`
      SELECT 
        ms.purchase_date,
        SUM(ms.total_cost) as daily_cost,
        COUNT(*) as purchase_count
      FROM material_stock ms
      WHERE ms.purchase_date >= NOW() - INTERVAL '30 days'
      GROUP BY ms.purchase_date
      ORDER BY ms.purchase_date DESC
      LIMIT 10
    `);

    const materialData = {
      stats: materialStatsResult.rows[0],
      stockLevels: stockLevelsResult.rows.map(row => ({
        materialname: row.material_name,
        total_quantity: parseInt(row.total_quantity || 0),
        unit: row.unit,
        stock_entries: parseInt(row.stock_entries || 0),
        avg_price: parseFloat(row.avg_price || 0)
      })),
      recentPurchases: materialPurchasesResult.rows.map(row => ({
        purchase_date: row.purchase_date,
        daily_cost: parseFloat(row.daily_cost || 0),
        purchase_count: parseInt(row.purchase_count || 0)
      }))
    };

    console.log('Material report data fetched successfully');
    res.json(materialData);
  } catch (error) {
    console.error('Error fetching material report:', error);
    res.status(500).json({ error: 'Failed to fetch material report data', details: error.message });
  }
});

// Product orders report endpoint
router.get('/product-orders', async (req, res) => {
  try {
    console.log('Fetching product orders data...');
    
    // Products with order statistics
    const productOrdersResult = await pool.query(`
      SELECT 
        p.product_name, 
        p.selling_price,
        COUNT(oi.orderitemid) as times_ordered,
        COALESCE(SUM(oi.quantity), 0) as total_quantity,
        COALESCE(SUM(oi.quantity * oi.unitprice), 0) as total_revenue
      FROM products p
      LEFT JOIN orderitems oi ON p.product_id = oi.productid
      LEFT JOIN orders o ON oi.orderno = o.orderid AND o.orderstatus IN ('delivered', 'pending')
      GROUP BY p.product_id, p.product_name, p.selling_price
      ORDER BY times_ordered DESC, total_quantity DESC
      LIMIT 20
    `);

    // Product category performance
    const categoryPerformanceResult = await pool.query(`
      SELECT 
        p.category,
        COUNT(DISTINCT p.product_id) as product_count,
        COUNT(oi.orderitemid) as total_orders,
        COALESCE(SUM(oi.quantity * oi.unitprice), 0) as category_revenue
      FROM products p
      LEFT JOIN orderitems oi ON p.product_id = oi.productid
      LEFT JOIN orders o ON oi.orderno = o.orderid AND o.orderstatus = 'delivered'
      WHERE p.category IS NOT NULL
      GROUP BY p.category
      ORDER BY category_revenue DESC
      LIMIT 10
    `);

    const productData = {
      productOrders: productOrdersResult.rows.map(row => ({
        productname: row.product_name,
        price: parseFloat(row.selling_price || 0),
        times_ordered: parseInt(row.times_ordered || 0),
        total_quantity: parseInt(row.total_quantity || 0),
        total_revenue: parseFloat(row.total_revenue || 0)
      })),
      categoryPerformance: categoryPerformanceResult.rows.map(row => ({
        category: row.category,
        product_count: parseInt(row.product_count || 0),
        total_orders: parseInt(row.total_orders || 0),
        category_revenue: parseFloat(row.category_revenue || 0)
      }))
    };

    console.log('Product orders data fetched successfully');
    res.json(productData);
  } catch (error) {
    console.error('Error fetching product orders:', error);
    res.status(500).json({ error: 'Failed to fetch product orders data', details: error.message });
  }
});

return router;
};

export default dashboardRouter;