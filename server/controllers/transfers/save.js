const Transactions = require('../../models/transactions');
const Wallets = require('../../models/wallets');

const tagLabel = 'saveTransfer';

module.exports = async (req, res) => {

    try {

        const transaction = new Transactions({...req.body, status: 'PEN', type: 'transfer', owner: req.locals.user.id });


        await transaction.validate();

        const debitedWallet = await Wallets.findOne({ _id: transaction.debitedWallet, owner: req.locals.user._id });
        const creditedWallet = await Wallets.findOne({ _id: transaction.creditedWallet, owner: req.locals.user._id });

        if(!debitedWallet || !creditedWallet)
            return res.forbidden('Some wallet is missing');


        const rapydPayload = {
            amount: req.body.amount,
            currency: debitedWallet.currency,
            destination_ewallet: creditedWallet.rapydId,
            source_ewallet: debitedWallet.rapydId,
        };

        const transResponse = await rapydClient.Transfers.create(rapydPayload).execute();

        transaction.rapydId = transResponse.data.id;
        transaction.status = transResponse.data.status;

        await transaction.save();

        //status values: accept, decline, cancel
        const acceptResponse = await rapydClient.TransferResponse.create({ id: transaction.rapydId, status: 'accept'}).execute();

        transaction.status = acceptResponse.data.status;

        await transaction.save();

        res.resolve(transaction);


    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};