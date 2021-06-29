const tagLabel = 'checkoutController';

module.exports = async (req, res) => {

    try {

        const response = await rapydClient.Checkout.create({
            amount: 10.15,
            currency: "EUR",
            country: "IT",
            ewallet: "ewallet_40fa929d2a297fb1f1aad37aeecfa4f6"
        }).execute();

        res.resolve({
            redirectUrl: response.data.redirect_url
        });

    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};