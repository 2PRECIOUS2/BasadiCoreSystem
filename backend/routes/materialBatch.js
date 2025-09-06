const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  router.put('/batch/:batch_id/status', async (req, res) => {
    const { batch_id } = req.params;
    const { status } = req.body;
    let client;
    try {
      client = await pool.connect();

      // 1. Get the batch and material_id
      const batchInfo = await client.query(
        `SELECT material_id FROM material_stock_items WHERE id = $1`,
        [batch_id]
      );
      if (batchInfo.rows.length === 0) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      const material_id = batchInfo.rows[0].material_id;

      // 2. Update batch status
      await client.query(
        `UPDATE material_stock_items SET batch_status = $1 WHERE id = $2`,
        [status, batch_id]
      );

      // 3. If activating, set all other batches for this material to inactive
      if (status === 'active') {
        await client.query(
          `UPDATE material_stock_items SET batch_status = 'inactive' WHERE material_id = $1 AND id != $2`,
          [material_id, batch_id]
        );
      }

      // 4. Update material unit_price and quantity to latest active batch
      const activeBatch = await client.query(
        `SELECT unit_price, quantity FROM material_stock_items
         WHERE material_id = $1 AND batch_status = 'active'
         ORDER BY batch_number DESC LIMIT 1`,
        [material_id]
      );
      let unit_price = 0;
      let quantity = 0;
      if (activeBatch.rows.length > 0) {
        unit_price = activeBatch.rows[0].unit_price;
        quantity = activeBatch.rows[0].quantity;
      }
      await client.query(
        `UPDATE materials SET unit_price = $1, quantity = $2 WHERE material_id = $3`,
        [unit_price, quantity, material_id]
      );

      res.json({ success: true, message: 'Batch status updated.' });
    } catch (err) {
      res.status(500).json({ message: 'Error updating batch status', error: err.message });
    } finally {
      if (client) client.release();
    }
  });

  return router;
};