const pool = require('../db');
const sendApprovalEmail = require('../utils/sendApprovalEmail');

exports.approveUser = async (req, res) => {
  const { id, token } = req.query;
  let client;

  try {
    client = await pool.connect();

    const userResult = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = userResult.rows[0];

    if (!user) return res.status(404).send('User not found.');
    if (user.status === 'approved') return res.status(200).send('User already approved.');
    if (user.approval_token !== token) return res.status(401).send('Invalid approval token.');

    await client.query(
      'UPDATE users SET status = $1, approval_token = NULL WHERE id = $2',
      ['approved', id]
    );

    await sendApprovalEmail(user.email, user.name, user.staff_id);

    res.send(`User ${user.name} approved successfully.`);
  } catch (err) {
    console.error('Approval error:', err.message);
    res.status(500).send('Server error during approval.');
  } finally {
    if (client) client.release();
  }
};
