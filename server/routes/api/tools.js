const express                  = require('express');
const toolsCtrl                = require('../../controllers/tools');
const rateLimiter               = require('../../middlewares/rate-limiter');
const { RateLimiterMongo }      = require('rate-limiter-flexible');

const router = express.Router();

const emailRates = new RateLimiterMongo({
    storeClient: require('mongoose').connection,
    keyPrefix: 'rateLimitsLogin',
    points: 1,
    duration: 10,
});

router.post('/tools/send-email-from-flow', rateLimiter.getMiddleware(emailRates), toolsCtrl.sendEmailFromFlow);

module.exports = router;