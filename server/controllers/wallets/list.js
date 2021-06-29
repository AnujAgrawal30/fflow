const Wallets = require('../../models/wallets');

const tagLabel = 'listWallets';

module.exports = async (req, res) => {

    try {

        const wallets = await Wallets.find({ owner: req.locals.user._id });

        res.resolve(wallets);

    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};