import cron from 'node-cron';

const orderStatusUpdate = (pool) => {
  // Schedule to run every day at 1am
  cron.schedule('0 1 * * *', async () => {
    try {
      const res = await pool.query(
        `UPDATE orders
         SET orderstatus = 'delivered', updatedat = NOW()
         WHERE orderstatus = 'pending' AND deliverydate < NOW()`
      );
      console.log(`Order status updater: ${res.rowCount} orders marked as delivered.`);
    } catch (err) {
      console.error('Order status updater failed:', err.message);
    }
  });
};

export default orderStatusUpdate;