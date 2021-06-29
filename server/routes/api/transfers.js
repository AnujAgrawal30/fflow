const express                  = require('express');
const transfersCtrl              = require('../../controllers/transfers');

const router = express.Router();

router.post('/transfers', transfersCtrl.save);

module.exports = router;