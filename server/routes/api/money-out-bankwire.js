const express                  = require('express');
const moneyOutBankwire         = require('../../controllers/money-out-bankwire');

const router = express.Router();

router.post('/money-out-bankwire', moneyOutBankwire.save);

module.exports = router;