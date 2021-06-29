const express                  = require('express');
const authCtrl                = require('../../controllers/auth');

const router = express.Router();

router.post('/auth/login', authCtrl.login);
router.post('/auth/logout', authCtrl.logout);

module.exports = router;