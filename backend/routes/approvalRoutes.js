const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/ApprovalController');

router.get('/approve-user', approvalController.approveUser);

module.exports = router;
