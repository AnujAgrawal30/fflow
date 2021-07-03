const express                  = require('express');
const hooksCtrl                = require('../../controllers/hooks');

const router = express.Router();

router.all('/flows/:flowId', hooksCtrl.userFlowHooks);
router.post('/rapyd', hooksCtrl.rapydFlowHooks);

module.exports = router;