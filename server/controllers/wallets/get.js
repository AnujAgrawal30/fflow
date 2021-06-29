const Wallets = require('../../models/wallets');

const tagLabel = 'getWallet';

module.exports = async (req, res) => {

    try {

        const wallet = await Wallets.findOne({ _id: req.params.id, owner: req.locals.user._id });

        if(!wallet)
            return res.notFound();

        const response = await rapydClient.Wallets.read(wallet.rapydId).execute();

        wallet.sync(response.data);

        await wallet.save();


        res.resolve(wallet);

    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};