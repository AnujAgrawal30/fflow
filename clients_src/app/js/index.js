const LiteGraph = require('../../../common/lib/litegraph');
const ApiClient = require('../../../common/services/api-client');
const Modal = require('./modals/abstract');
const blockingLoader = require('./blocking-loader');

const Blocks = require('../../../common/blocks');

window.apiClient = new ApiClient('development', 'FE', {
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
    }, apiClient);

flowEditor.graphcanvas.render_canvas_border = false;

window.addEventListener("resize", function() { flowEditor.graphcanvas.resize(); } );

//enable scripting
LiteGraph.allow_scripts = true;
flowEditor.graphcanvas.show_info = true;
flowEditor.graphcanvas.allow_searchbox = false;

LiteGraph.registerNodeType(Blocks.ClickBlock.menu, Blocks.ClickBlock);
LiteGraph.registerNodeType(Blocks.LogOnTriggerBlock.menu, Blocks.LogOnTriggerBlock);
LiteGraph.registerNodeType(Blocks.ProbeBlock.menu, Blocks.ProbeBlock);
LiteGraph.registerNodeType(Blocks.BranchBlock.menu, Blocks.BranchBlock);
LiteGraph.registerNodeType(Blocks.TimeWeeklyBlock.menu, Blocks.TimeWeeklyBlock);
LiteGraph.registerNodeType(Blocks.TimeDailyBlock.menu, Blocks.TimeDailyBlock);
LiteGraph.registerNodeType(Blocks.WalletBlock.menu, Blocks.WalletBlock);
LiteGraph.registerNodeType(Blocks.TransferBlock.menu, Blocks.TransferBlock);
LiteGraph.registerNodeType(Blocks.BankwireBlock.menu, Blocks.BankwireBlock);
LiteGraph.registerNodeType(Blocks.NumberBlock.menu, Blocks.NumberBlock);

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
