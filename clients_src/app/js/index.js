const LiteGraph = require('../../../common/lib/litegraph');
const ApiClient = require('../../../common/services/api-client');
const Modal = require('./modals/abstract');
const blockingLoader = require('./blocking-loader');

const ClickBlock = require('../../../common/blocks/debug-click');
const LogOnTriggerBlock = require('../../../common/blocks/debug-log-on-trigger');
const ProbeBlock = require('../../../common/blocks/debug-probe-value');
const BranchBlock = require('../../../common/blocks/logic-branch');
const TimeWeeklyBlock = require('../../../common/blocks/time-weekly');
const TimeDailyBlock = require('../../../common/blocks/time-daily');
const WalletBlock = require('../../../common/blocks/finance-wallet');
const TransferBlock = require('../../../common/blocks/finance-transfer');
const BankwireBlock = require('../../../common/blocks/finance-bankwire');
const NumberBlock = require('../../../common/blocks/utility-number');

window.apiClient = new ApiClient('development', null, {
    global403ErrorManager: (error) => {
        Modal.Toast("error", error.message, 7000);
    },
    global500ErrorManager: () => {
        Modal.Toast("error", "The service is not available at the moment, please retry later", 7000);
    }
});

const Editor = require('./editor');

LiteGraph.Editor = Editor;

const flowId = document.getElementById('main-script').getAttribute('data-flow-id');

window.flowEditor = new LiteGraph.Editor(
    "main",
    {
        miniwindow:false,
        onSave: async function () {
            blockingLoader.show();
            const data = JSON.stringify( flowEditor.graph.serialize() );
            await apiClient.Flows.update(flowId, { logic: data }).execute();
            blockingLoader.hide();
            Modal.Toast("success", "Flow saved!");
        }
    });

flowEditor.graphcanvas.render_canvas_border = false;

window.addEventListener("resize", function() { flowEditor.graphcanvas.resize(); } );

//enable scripting
LiteGraph.allow_scripts = true;
flowEditor.graphcanvas.show_info = true;
flowEditor.graphcanvas.allow_searchbox = false;

LiteGraph.registerNodeType("Debug/Click", ClickBlock);
LiteGraph.registerNodeType("Debug/Log on trigger", LogOnTriggerBlock);
LiteGraph.registerNodeType("Debug/Probe", ProbeBlock);
LiteGraph.registerNodeType("Logic/Branch", BranchBlock);
LiteGraph.registerNodeType("Schedule/Weekly", TimeWeeklyBlock);
LiteGraph.registerNodeType("Schedule/Daily", TimeDailyBlock);
LiteGraph.registerNodeType("Finance/Get Wallet", WalletBlock);
LiteGraph.registerNodeType("Finance/Transfer between wallets", TransferBlock);
LiteGraph.registerNodeType("Finance/Outgoing Bankwire", BankwireBlock);
LiteGraph.registerNodeType("Constant/Number", NumberBlock);

loadFlow = async () => {
    const response = await apiClient.Flows.read(flowId).execute();
    flowEditor.graph.configure(JSON.parse(response.data.logic));
    //console.log(JSON.parse(response.data.logic));
    blockingLoader.hide();
    flowEditor.graph.start();
}

blockingLoader.show();
loadFlow();


const foo = require('./modals/create-user');
foo.show();
