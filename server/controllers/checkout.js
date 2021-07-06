const Joi = require('joi');
const Wallets = require('../models/wallets');

const tagLabel = 'checkoutController';

const schema = Joi.object({
    amount: Joi.number().min(1).max(1000).required(),
    country: Joi.string().allow(...api.config.client.supportedCountries),
    walletId: Joi.string().required(),
});


module.exports = async (req, res) => {

    try {

        const validation = schema.validate(req.body);

        if(validation.error) {
            return res.forbidden(validation.error.details[0].message);
        }

        const wallet = await Wallets.findOne({ _id: req.body.walletId });

        if(!wallet)
            return res.forbidden("Cannot pay at the moment");

        const response = await rapydClient.Checkout.create({
            amount: parseFloat(req.body.amount),
            currency: wallet.currency,
            country: req.body.country,
            ewallet: wallet.rapydId,
            complete_checkout_url: api.config.wallets.thankYouPage,
            complete_payment_url: api.config.wallets.thankYouPage,
            cancel_checkout_url: api.config.wallets.koPage
        }).execute();

        res.resolve({
            redirectUrl: response.data.redirect_url
        });

    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};