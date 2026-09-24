const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/products', clientController.getProducts);
router.post('/orders', clientController.createOrder);

module.exports = router;