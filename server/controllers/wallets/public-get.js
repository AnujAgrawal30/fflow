const Wallets = require('../../models/wallets');

const tagLabel = 'publicGetWallet';

module.exports = async (req, res) => {

    try {

        const wallet = await Wallets.findOne({ _id: req.params.id });

        if(!wallet)
            return res.notFound();


        res.resolve({
            meta: wallet.meta,
            currency: wallet.currency
        });

    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};