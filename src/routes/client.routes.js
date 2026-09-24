import { Router } from 'express';
import { getProducts, createOrder, getOrders } from '../controllers/clientController.js';

const router = Router();

// /api/products
router.get('/products', getProducts);

// /api/orders
router.post('/orders', createOrder);
router.get('/orders', getOrders);

export default router;