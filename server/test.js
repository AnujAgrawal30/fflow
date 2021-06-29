require('dotenv').config();

const Rapyd = require('./services/rapyd');

const rapydClient = new Rapyd(process.env.RAPYD_CLIENT_PUBLIC, process.env.RAPYD_CLIENT_SECRET, process.env.ENV);


async function test() {

    try {
        //console.log(await rapydClient.Data.Countries.list().execute());
        console.log(await rapydClient.Identities.Types.list({ country: 'US'}).execute());
    }
    catch (error) {
        console.log(error);
    }
}

//test();


const LiteGraph = require('../common/lib/litegraph');

const ClickBlock = require('../common/blocks/debug-click');
const LogEventBlock = require('../common/blocks/debug-log');
const BranchBlock = require('../common/blocks/logic-branch');
const TimeWeeklyBlock = require('../common/blocks/time-weekly');

LiteGraph.registerNodeType("Debug/Click", ClickBlock);
LiteGraph.registerNodeType("Debug/LogEvents", LogEventBlock);
LiteGraph.registerNodeType("Logic/Branch", BranchBlock);
LiteGraph.registerNodeType("Schedule/Weekly", TimeWeeklyBlock);

const graph = new LiteGraph.LGraph();

graph.configure(JSON.parse("{\"last_node_id\":20,\"last_link_id\":18,\"nodes\":[{\"id\":1,\"type\":\"Debug/Click\",\"pos\":[250,145],\"size\":[170,90],\"flags\":{},\"order\":0,\"mode\":0,\"outputs\":[{\"name\":\"event\",\"type\":-1,\"links\":[18]}],\"title\":\"Click Event\",\"properties\":{\"text\":\"Click\",\"fontSize\":20}},{\"id\":3,\"type\":\"Debug/LogEvents\",\"pos\":[651,162],\"size\":{\"0\":140,\"1\":26},\"flags\":{},\"order\":1,\"mode\":0,\"inputs\":[{\"name\":\"event\",\"type\":-1,\"link\":18}],\"title\":\"Log Event\",\"properties\":{}}],\"links\":[[18,1,0,3,0,-1]],\"groups\":[],\"config\":{},\"extra\":{},\"version\":0.4}"));

const node = graph.getNodeById(1);

//console.log(graph.findNodesByType('Debug/LogEvents'));

console.log(node.foo());