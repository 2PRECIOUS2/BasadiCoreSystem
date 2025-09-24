const express = require('express');
const router = express.Router();
module.exports = (pool) => {

// GET /api/orders - Fixed SQL query
router.get('/', async (req, res) => {
  try {
    console.log('Fetching orders...');
    const orders = await pool.query(`
      SELECT 
        o.orderno,
        CASE 
          WHEN o.order_type = 'project' THEN COALESCE(o.cust_fname || ' ' || o.cust_lname, 'Unknown')
          ELSE COALESCE(c.cust_fname || ' ' || c.cust_lname, 'Unknown')
        END AS customer_name,
        o.deliverydate,
        o.deliveryaddress,
        o.totalamount,
        o.orderstatus,
        o.comment,
        o.order_type,
        o.cust_fname,
        o.cust_lname,
        o.project_id,
        p.project_name AS project_name
      FROM orders o
      LEFT JOIN customers c ON o.customerid = c.cust_id
      LEFT JOIN projects p ON o.project_id = p.project_id
      ORDER BY o.orderno DESC
    `);

    console.log(`Found ${orders.rows.length} orders`);

    const formattedOrders = orders.rows.map(order => {
      console.log('Processing order:', order.orderno, 'Address:', order.deliveryaddress);
      
      let addrObj = {};
      try {
        if (order.deliveryaddress) {
          addrObj = typeof order.deliveryaddress === 'string'
            ? JSON.parse(order.deliveryaddress)
            : order.deliveryaddress;
        }
      } catch (parseError) {
        console.error('Error parsing address for order', order.orderno, ':', parseError);
        addrObj = {};
      }

      // Format address consistently
      let formattedAddress = 'No address';
      if (addrObj && typeof addrObj === 'object') {
        const street = addrObj.streetAddress || addrObj.street_address || '';
        const city = addrObj.city || '';
        const state = addrObj.stateProvince || addrObj.state_province || '';
        const postal = addrObj.postalCode || addrObj.postal_code || '';
        const country = addrObj.country || '';
        
        const addressParts = [street, city, state, postal, country]
          .filter(part => part && part.trim() && part !== 'null');
        
        if (addressParts.length > 0) {
          formattedAddress = addressParts.join(', ');
        }
      }

      return {
        orderno: order.orderno,
        customer: order.customer_name || 'Unknown',
        deliveryAddress: formattedAddress,
        deliveryaddress: addrObj,
        deliverydate: order.deliverydate,
        totalamount: Number(order.totalamount) || 0,
        status: order.orderstatus ? order.orderstatus.charAt(0).toUpperCase() + order.orderstatus.slice(1) : 'Unknown',
        comment: order.comment || '',
        order_type: order.order_type || 'standard',
        project_id: order.project_id,
        project_name: order.project_name || null
      };
    });

    console.log('Sending formatted orders:', formattedOrders.length);
    res.json(formattedOrders);

  } catch (err) {
    console.error('Error fetching orders:', err);
    console.error('Error details:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Failed to fetch orders', 
      details: err.message 
    });
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
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Create new order - Updated to handle project_id
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      cust_id,
      delivery_address,
      delivery_date,
      comment,
      items,
      payment_method = 'cash',
      amount_paid = 0,
      order_type = 'standard',
      cust_fname,
      cust_lname,
      project_address,
      order_date,
      project_id
    } = req.body;

    console.log('Creating order with data:', { 
      order_type, 
      project_id, 
      cust_fname, 
      cust_lname,
      delivery_address,
      project_address 
    });

    // Validation: For project orders, first name, last name, and project are required
    if (order_type === 'project') {
      if (!cust_fname || !cust_lname) {
        return res.status(400).json({ 
          success: false, 
          message: 'First name and last name are required for project orders' 
        });
      }
      if (!project_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Project selection is required for project orders' 
        });
      }
    }

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

    // 3️⃣ Determine order status and delivery date
    let orderStatus = 'pending';
    let deliveryDateToSave = delivery_date;
    let deliveryAddressToSave = delivery_address;

    if (order_type === 'project') {
      orderStatus = 'delivered';
      deliveryDateToSave = order_date;
      deliveryAddressToSave = project_address;
    }

    console.log('Final address to save:', deliveryAddressToSave);

    // 4️⃣ Insert order with project_id
    const orderRes = await client.query(
      `INSERT INTO orders 
       (customerid, deliveryaddress, deliverydate, comment, totalamount, totalitems, orderstatus, createdat, updatedat, order_type, cust_fname, cust_lname, project_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW(),$8,$9,$10,$11) RETURNING orderno`,
      [
        cust_id || null,
        JSON.stringify(deliveryAddressToSave),
        deliveryDateToSave,
        comment,
        totalAmount,
        totalItems,
        orderStatus,
        order_type,
        order_type === 'project' ? cust_fname : null,
        order_type === 'project' ? cust_lname : null,
        order_type === 'project' ? project_id : null
      ]
    );
    const orderno = orderRes.rows[0].orderno;

    // 5️⃣ Insert order items and deduct stock
    for (const item of items) {
      await client.query(
        `INSERT INTO orderitems (orderno, productid, quantity, unitprice) VALUES ($1,$2,$3,$4)`,
        [orderno, item.product_id, item.quantity, item.unit_price]
      );

      await client.query(
        `UPDATE products
         SET quantity = quantity - $1
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

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
    console.error('Order creation failed:', err.message);
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
    console.error('Cancel order error:', err);
    res.status(500).json({ error: 'Failed to cancel order', details: err.message });
  }
});

return router;
};