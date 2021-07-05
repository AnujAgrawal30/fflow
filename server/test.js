require('dotenv').config();
require('./utils/i18n');

const jwt = require('jsonwebtoken');
const moment = require('moment');

const ApiClient = require('../common/services/api-client');
const Flows = require('./models/flows');

require('./utils/db');

const LiteGraph = require('../common/lib/litegraph');

const ClickBlock = require('../common/blocks/debug-click');
const LogOnTriggerBlock = require('../common/blocks/debug-log-on-trigger');
const BranchBlock = require('../common/blocks/logic-branch');
const TimeWeeklyBlock = require('../common/blocks/time-weekly');
const TimeDailyBlock = require('../common/blocks/time-daily');
const NumberBlock = require('../common/blocks/utility-number');
const WalletBlock = require('../common/blocks/finance-wallet');


LiteGraph.registerNodeType(ClickBlock.menu, ClickBlock);
LiteGraph.registerNodeType("Debug/Log on trigger", LogOnTriggerBlock);
LiteGraph.registerNodeType("Logic/Branch", BranchBlock);
LiteGraph.registerNodeType("Schedule/Weekly", TimeWeeklyBlock);
LiteGraph.registerNodeType("Schedule/Daily", TimeDailyBlock);
LiteGraph.registerNodeType("Constant/Number", NumberBlock);
LiteGraph.registerNodeType("Finance/Get Wallet", WalletBlock);

const wait = async (time) => new Promise(resolve => setTimeout(resolve, time));

const waitForCompletion = async (graph, iteration = 1) => {

    if(iteration >= 10)
        return Promise.reject('timeout');

    await wait(1000);

    if(graph.apiClient.runningRequests === 0)
        return Promise.resolve();

    return waitForCompletion(graph, iteration++);

};

async function run() {

    const lookupDate = moment().startOf('hour').toDate();


    require('./models/users');

    const flows = await Flows
        .find({ status: 'active', 'nextCronEvent.date': lookupDate })
        .populate('owner');

    for(let f = 0; f < flows.length; f++) {

        const flow = flows[f];

        //await Flows.findOneAndUpdate({ _id: flow._id }, { status: 'running' });

        const apiClient = new ApiClient(process.env.ENV, 'BE');

        apiClient.setSession({
            token: jwt.sign({
                data: String(flow.owner._id)
            }, process.env.JWT_SECRET, { expiresIn: 60 })
        });

        const graph = new LiteGraph.LGraph(null, apiClient);

        const logic = JSON.parse(flow.logic);

        graph.configure(logic);

        graph.start();


        for(let n = 0; n < flow.nextCronEvent.nodes.length; n++) {

            const nodeId = flow.nextCronEvent.nodes[n];

            const node = graph.getNodeById(nodeId);

            setTimeout(()=>node.triggerEvent(), 0);

            await waitForCompletion(graph);

            console.log("DONE!");

        }



    }

}

run();
