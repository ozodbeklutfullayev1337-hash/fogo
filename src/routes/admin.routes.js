const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.post('/products', adminController.createProduct);

module.exports = router;