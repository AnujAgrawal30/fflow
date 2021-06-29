const express                  = require('express');
const checkoutCtrl             = require('../../controllers/checkout');

const router = express.Router();

router.post('/checkout', checkoutCtrl);

module.exports = router;