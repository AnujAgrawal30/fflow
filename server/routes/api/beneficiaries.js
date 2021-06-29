const express                  = require('express');
const beneficiariesCtrl             = require('../../controllers/beneficiaries');

const router = express.Router();

router.post('/beneficiaries', beneficiariesCtrl.save);
router.get('/beneficiaries/:id', beneficiariesCtrl.get);
router.get('/beneficiaries', beneficiariesCtrl.list);

module.exports = router;