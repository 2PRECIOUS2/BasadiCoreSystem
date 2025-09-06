const cron = require('node-cron');

module.exports = (pool) => {
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