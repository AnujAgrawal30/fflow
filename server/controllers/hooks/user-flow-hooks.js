const Flows = require('../../models/flows');
const agenda = require('../../services/agenda');

const tagLabel = 'userFlowHooksController';

module.exports = async (req, res) => {

    try {

        const flow = await Flows.findOne({ _id: req.params.flowId });

        if(!flow)
            return res.notFound();

        if(!flow.incomingUserWebhook.active)
            return res.forbidden('No active webhook is this flow');

        if(flow.incomingUserWebhook.method !== "*" && req.method !== flow.incomingUserWebhook.method)
            return res.forbidden('Unsupported HTTP Method');

        if(flow.incomingUserWebhook.secret) {

            const sign = req.headers['x-signature-sha256'];

            const hash = "sha256=" + crypto.createHmac('sha256', flow.incomingUserWebhook.secret).update(JSON.stringify(req.body)).digest('hex');

            if(hash !== sign)
                return res.forbidden("Sign is not correct");

        }

        await agenda.now('execute flow', { flowId: flow._id, trigger: 'incomingUserWebhook', body: req.body });


        res.resolve({ status: 'ok' });


    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};