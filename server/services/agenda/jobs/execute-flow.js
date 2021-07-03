const jwt = require('jsonwebtoken');

const Blocks = require('../../../../common/blocks');
const LiteGraph = require('../../../../common/lib/litegraph');
const ApiClient = require('../../../../common/services/api-client');

const Flows = require('../../../models/flows');

require('../../../models/users');

const tagLabel = 'executeFlowsJob';

LiteGraph.registerNodeType(Blocks.ClickBlock.menu, Blocks.ClickBlock);
LiteGraph.registerNodeType(Blocks.LogOnTriggerBlock.menu, Blocks.LogOnTriggerBlock);
LiteGraph.registerNodeType(Blocks.ProbeBlock.menu, Blocks.ProbeBlock);
LiteGraph.registerNodeType(Blocks.BranchBlock.menu, Blocks.BranchBlock);
LiteGraph.registerNodeType(Blocks.TimeWeeklyBlock.menu, Blocks.TimeWeeklyBlock);
LiteGraph.registerNodeType(Blocks.TimeDailyBlock.menu, Blocks.TimeDailyBlock);
LiteGraph.registerNodeType(Blocks.WalletBlock.menu, Blocks.WalletBlock);
LiteGraph.registerNodeType(Blocks.TransferBlock.menu, Blocks.TransferBlock);
LiteGraph.registerNodeType(Blocks.OnMoneyInBlock.menu, Blocks.OnMoneyInBlock);
LiteGraph.registerNodeType(Blocks.BankwireBlock.menu, Blocks.BankwireBlock);
LiteGraph.registerNodeType(Blocks.NumberBlock.menu, Blocks.NumberBlock);
LiteGraph.registerNodeType(Blocks.NetworkIncomingWebhook.menu, Blocks.NetworkIncomingWebhook);


const wait = async (time) => new Promise(resolve => setTimeout(resolve, time));

const waitForCompletion = async (job, graph, iteration = 1) => {

    if(iteration >= 10)
        return Promise.reject('timeout');

    await job.touch();
    await wait(1000);

    if(graph.apiClient.runningRequests === 0)
        return Promise.resolve();

    return waitForCompletion(job, graph, iteration++);

};


module.exports = agenda => {

    agenda.define('execute flow', { concurrency: 5 }, async job => {
        utilities.logger.info('Running JOB', { tagLabel, data: job.attrs.data });

        let flow;

        try {

            flow = await Flows.findOne({_id: job.attrs.data.flowId}).populate('owner');

            if (!flow)
                return Promise.reject('Flow not found');

            const apiClient = new ApiClient(process.env.ENV, 'BE');

            apiClient.setSession({
                token: jwt.sign({
                    data: String(flow.owner._id)
                }, process.env.JWT_SECRET, {expiresIn: 60})
            });

            const graph = new LiteGraph.LGraph(null, apiClient);

            const logic = JSON.parse(flow.logic);

            graph.configure(logic);

            graph.start();


            if (job.attrs.data.trigger === 'schedule') {

                for (let n = 0; n < flow.nextCronEvent.nodes.length; n++) {

                    const nodeId = flow.nextCronEvent.nodes[n];

                    const node = graph.getNodeById(nodeId);

                    setTimeout(() => node.triggerEvent(), 0);

                    await waitForCompletion(job, graph);

                    flow.refreshSchedules();

                }

            }
            else if(job.attrs.data.trigger === 'incomingUserWebhook') {


                const entryNodes = graph.findNodesByType('Network/Incoming Webhook');


                if(entryNodes.length >= 1) {

                    setTimeout(() => entryNodes[0].triggerEvent(0, job.attrs.data.body), 0);

                    await waitForCompletion(job, graph);

                }

            }
            else if(job.attrs.data.trigger === 'rapydWebhook') {

                const entryNodes = graph.findNodesByType('Finance/Detect money in');

                const entryNode = entryNodes.find(node => node.properties && job.attrs.data.walletId.equals(node.properties.wallet._id));

                setTimeout(() => entryNode.triggerEvent(job.attrs.data.payment), 0);

                await waitForCompletion(job, graph);

            }
            else {
                return Promise.reject('Unknown trigger');
            }

            flow.lastExecution.completed = true;
            flow.lastExecution.date = new Date();
            await flow.save();

            utilities.logger.debug("Flow completed", { tagLabel });
            return Promise.resolve();

        } catch (error) {

            if(flow) {

                flow.lastExecution.completed = true;
                flow.lastExecution.date = new Date();
                flow.refreshSchedules();
                await flow.save();

            }

            utilities.logger.error("Job crashed", {tagLabel, error});
            return Promise.reject('Job crashed');

        }

    });


    utilities.logger.info('Job declared', {tagLabel});

};