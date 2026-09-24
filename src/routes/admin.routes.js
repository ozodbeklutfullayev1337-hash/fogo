import { Router } from 'express';
import { getAdminOrders, updateOrderStatus } from '../controllers/adminController.js';

const router = Router();

// /api/admin/orders
router.get('/orders', getAdminOrders);

// /api/admin/orders/:id/status
router.patch('/orders/:id/status', updateOrderStatus);

export default router;