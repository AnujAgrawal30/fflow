const express                  = require('express');
const walletsCtrl              = require('../../controllers/wallets');

const router = express.Router();

router.get('/wallets/:id', walletsCtrl.get);
router.post('/wallets', walletsCtrl.save);
router.get('/wallets', walletsCtrl.list);

module.exports = router;