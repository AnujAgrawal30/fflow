const Wallets = require('../../models/wallets');
const Flows = require('../../models/flows');
const agenda = require('../../services/agenda');

const tagLabel = 'controllerName';

module.exports = async (req, res) => {

    try {

        if(!req.body.type || req.body.type !== 'PAYMENT_SUCCEEDED')
            return res.resolve();

        const response = await rapydClient.Payments.read(req.body.data.id).execute();

        const payment = response.data;

        if(payment.status !== 'CLO')
            return res.resolve();

        const wallet = await Wallets.findOne({ rapydId: payment.ewallet_id });

        if(!wallet)
            return res.resolve();

        const flow = await Flows.findOne( {
            'incomingRapydWebhook.relevantWallet': wallet._id,
            'incomingRapydWebhook.relevantTransactionType': 'moneyIn',
            status: 'active' });

        if(!flow)
            return res.resolve();

        await agenda.now('execute flow', { trigger: 'rapydWebhook', flowId: flow._id, payment: payment, walletId: wallet._id });


        res.resolve();

    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};