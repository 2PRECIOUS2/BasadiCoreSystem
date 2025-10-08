import express from 'express';

const orderInvoiceRouter = (pool) => {
  const router = express.Router();

  // GET /api/order-invoice/:orderno
router.get('/:orderno', async (req, res) => {
  const { orderno } = req.params;

  try {
    console.log('Fetching order:', orderno);

    const orderRes = await pool.query(`
      SELECT o.orderno, o.order_type, o.deliveryaddress, o.deliverydate, o.totalamount, o.totalitems, o.orderstatus,
             o.comment, c.cust_fname, c.cust_lname, c.street_address, c.city, c.state_province, c.postal_code, c.country
      FROM orders o
      LEFT JOIN customers c ON o.customerid = c.cust_id
      WHERE o.orderno = $1
    `, [orderno]);

    if (!orderRes.rows.length) {
      console.log('Order not found');
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderRes.rows[0];

    // Safe parse of deliveryaddress
    let deliveryAddress = {};
    try {
      deliveryAddress = typeof order.deliveryaddress === 'string'
        ? JSON.parse(order.deliveryaddress)
        : order.deliveryaddress || {};
    } catch {
      deliveryAddress = {};
    }

    const invoiceRes = await pool.query(`SELECT * FROM orders_invoices WHERE orderno = $1`, [orderno]);
    const invoice = invoiceRes.rows[0] || null;

    const itemsRes = await pool.query(`
      SELECT oi.*, COALESCE(p.product_name, 'Unknown Product') AS product_name
      FROM orderitems oi
      LEFT JOIN products p ON oi.productid = p.product_id
      WHERE oi.orderno = $1
    `, [orderno]);
    const items = itemsRes.rows || [];

    // Return safe object
    res.json({ 
  order: { ...order, deliveryaddress: deliveryAddress }, 
  invoice, 
  items,
  customer: {
    cust_fname: order.cust_fname,
    cust_lname: order.cust_lname,
    street_address: order.street_address,
    city: order.city,
    state_province: order.state_province,
    postal_code: order.postal_code,
    country: order.country
  }
});


  } catch (err) {
    console.error('Failed to fetch order invoice:', err);
    res.status(500).json({ error: 'Failed to fetch order invoice' });
  }
});


  return router;
};

export default orderInvoiceRouter;
