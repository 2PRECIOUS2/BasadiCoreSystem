const express = require('express');
const router = express.Router();
module.exports = (pool) => {
// GET /api/orders
 
router.get('/', async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT 
        o.orderno,
        c.cust_fname || ' ' || c.cust_lname AS customer_name,
        o.deliverydate,
        o.deliveryaddress,
        o.totalamount,
        o.orderstatus,
        o.comment
      FROM orders o
      LEFT JOIN customers c ON o.customerid = c.cust_id
      ORDER BY o.orderno DESC
    `);

    const formattedOrders = orders.rows.map(order => {
  let addrObj = {};
  try {
    // deliveryaddress is already JSON in your DB, parse just in case
    addrObj = typeof order.deliveryaddress === 'string'
      ? JSON.parse(order.deliveryaddress)
      : order.deliveryaddress || {};
  } catch {
    addrObj = {};
  }

  return {
    orderno: order.orderno,
    customer: order.customer_name || 'Unknown',
    deliveryAddress: `${addrObj.streetAddress || ''}, ${addrObj.city || ''}, ${addrObj.country || ''}`, // table view
    deliveryaddress: addrObj, // full object for modal
    deliverydate: order.deliverydate,
    totalamount: Number(order.totalamount),
    status: order.orderstatus.charAt(0).toUpperCase() + order.orderstatus.slice(1),
    comment: order.comment || ''
  };
});


    res.json(formattedOrders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/orders/:orderno
router.put('/:orderno', async (req, res) => {
  const { deliveryAddress, deliveryDate, comment } = req.body;
  try {
    await pool.query(
      `UPDATE orders
       SET deliveryaddress = $1, deliverydate = $2, comment = $3, updatedat = NOW()
       WHERE orderno = $4`,
      [JSON.stringify(deliveryAddress), deliveryDate, comment, req.params.orderno]
    );
    res.json({ success: true, message: 'Order updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

  // Create new order
  router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { cust_id, delivery_address, delivery_date, comment, items, payment_method = 'cash', amount_paid = 0 } = req.body;

    await client.query('BEGIN');

    // 1️⃣ Check stock for each item
    for (const item of items) {
      const productRes = await client.query(
        `SELECT quantity, product_name FROM products WHERE product_id = $1`,
        [item.product_id]
      );

      if (!productRes.rows.length) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }

      const availableQty = productRes.rows[0].quantity;
      if (item.quantity > availableQty) {
        throw new Error(`Insufficient stock for "${productRes.rows[0].product_name}". Available: ${availableQty}, Requested: ${item.quantity}`);
      }
    }

    // 2️⃣ Calculate totals
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

    // 3️⃣ Determine order status
    const orderStatus = new Date(delivery_date) < new Date() ? 'delivered' : 'pending';

    // 4️⃣ Insert order
    const orderRes = await client.query(
      `INSERT INTO orders 
       (customerid, deliveryaddress, deliverydate, comment, totalamount, totalitems, orderstatus, createdat, updatedat)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING orderno`,
      [cust_id, delivery_address, delivery_date, comment, totalAmount, totalItems, orderStatus]
    );
    const orderno = orderRes.rows[0].orderno;

    // 5️⃣ Insert order items and deduct stock
    // ...existing code...
for (const item of items) {
  await client.query(
    `INSERT INTO orderitems (orderno, productid, quantity, unitprice) VALUES ($1,$2,$3,$4)`,
    [orderno, item.product_id, item.quantity, item.unit_price]
  );

  // Log product_id and quantity before update
  console.log(`Attempting to update product:`, item.product_id, 'Quantity:', item.quantity);

  const updateRes = await client.query(
    `UPDATE products
     SET quantity = quantity - $1
     WHERE product_id = $2`,
    [item.quantity, item.product_id]
  );
  console.log(`Updated product ${item.product_id}, affected rows:`, updateRes.rowCount);
}
// ...existing code...

    // 6️⃣ Create invoice
    const invoiceRes = await client.query(
      `INSERT INTO orders_invoices (orderno, invoicedate, amountpaid, paymentmethod, status, createdat) 
       VALUES ($1,NOW(),$2,$3,'unpaid',NOW()) RETURNING invoiceno`,
      [orderno, amount_paid, payment_method]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderno,
      invoiceno: invoiceRes.rows[0].invoiceno
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order creation failed', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});


  //Cancel Order
    router.put('/:orderno/cancel', async (req, res) => {
    const { orderno } = req.params;
    try {
      const orderRes = await pool.query(
        "SELECT orderstatus FROM orders WHERE orderno = $1",
        [orderno]
      );

      if (!orderRes.rows.length) return res.status(404).json({ error: 'Order not found' });

      if (orderRes.rows[0].orderstatus.toLowerCase() !== 'pending') {
        return res.status(400).json({ error: 'Only pending orders can be cancelled' });
      }

      const itemsRes = await pool.query(
        "SELECT productid, quantity FROM orderitems WHERE orderno = $1",
        [orderno]
      );

      await pool.query('BEGIN');

      for (const item of itemsRes.rows) {
        await pool.query(
          `UPDATE products SET quantity = quantity + $1 WHERE product_id = $2`,
          [item.quantity, item.productid]
        );
      }

      await pool.query(
        `UPDATE orders SET orderstatus='cancelled', updatedat=NOW() WHERE orderno=$1`,
        [orderno]
      );

      await pool.query('COMMIT');
      res.json({ message: 'Order cancelled successfully' });

    } catch (err) {
      try { await pool.query('ROLLBACK'); } catch {}
      console.error(err);
      res.status(500).json({ error: 'Failed to cancel order', details: err.message });
    }
  });

  return router; // <--- MUST return router
};
