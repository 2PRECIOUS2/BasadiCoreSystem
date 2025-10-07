import express from 'express';
import approvalController from '../controllers/ApprovalController.js';

const router = express.Router();

router.get('/approve-user', approvalController.approveUser);

export default router;
