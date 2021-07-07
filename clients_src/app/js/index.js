const LiteGraph = require('../../../common/lib/litegraph');
const Modal = require('./modals/abstract');
const blockingLoader = require('./blocking-loader');

const Blocks = require('../../../common/blocks');

require('./bootstrap-api-client');

const Editor = require('./editor');

LiteGraph.Editor = Editor;

const flowId = document.getElementById('main-script').getAttribute('data-flow-id');

window.flowEditor = new LiteGraph.Editor(
    "main",
    {
        miniwindow: false,
        onSave: async function (exit = false) {
            blockingLoader.show();
            const data = JSON.stringify( flowEditor.graph.serialize() );
            await apiClient.Flows.update(flowId, { logic: data }).execute();
            blockingLoader.hide();

            if(!exit)
                Modal.Toast("success", "Flow saved!");
            else
                window.location.href = "/app/list-flows.html";
        },
        onFlowStatus: async function(status) {
            blockingLoader.show();
            const data = JSON.stringify( flowEditor.graph.serialize() );
            await apiClient.Flows.update(flowId, { logic: data, status }).execute();
            blockingLoader.hide();

            if(status === 'active')
                Modal.Toast("success", "The flow is now active, any events or schedules will be managed by FFlow servers now", 5000);
            else if(status === 'inactive')
                Modal.Toast("success", "The flow is now deactivated, no events or schedules will be process", 5000);
        },
        onExit: () => window.location.href = '/app/list-flows.html'
    }, apiClient);

flowEditor.graphcanvas.render_canvas_border = false;

window.addEventListener("resize", function() { flowEditor.graphcanvas.resize(); } );

//enable scripting
LiteGraph.allow_scripts = false;
flowEditor.graphcanvas.show_info = false;
flowEditor.graphcanvas.allow_searchbox = false;

LiteGraph.registerNodeType(Blocks.ClickBlock.menu, Blocks.ClickBlock);
LiteGraph.registerNodeType(Blocks.LogOnTriggerBlock.menu, Blocks.LogOnTriggerBlock);
LiteGraph.registerNodeType(Blocks.ProbeBlock.menu, Blocks.ProbeBlock);
LiteGraph.registerNodeType(Blocks.BranchBlock.menu, Blocks.BranchBlock);

LiteGraph.registerNodeType(Blocks.TimeDailyBlock.menu, Blocks.TimeDailyBlock);
LiteGraph.registerNodeType(Blocks.TimeWeeklyBlock.menu, Blocks.TimeWeeklyBlock);
LiteGraph.registerNodeType(Blocks.TimeMonthlyBlock.menu, Blocks.TimeMonthlyBlock);

LiteGraph.registerNodeType(Blocks.WalletBlock.menu, Blocks.WalletBlock);
LiteGraph.registerNodeType(Blocks.TransferBlock.menu, Blocks.TransferBlock);
LiteGraph.registerNodeType(Blocks.BankwireBlock.menu, Blocks.BankwireBlock);
LiteGraph.registerNodeType(Blocks.OnMoneyInBlock.menu, Blocks.OnMoneyInBlock);

LiteGraph.registerNodeType(Blocks.NumberBlock.menu, Blocks.NumberBlock);
LiteGraph.registerNodeType(Blocks.NetworkIncomingWebhook.menu, Blocks.NetworkIncomingWebhook);

LiteGraph.registerNodeType(Blocks.UtilityOnce.menu, Blocks.UtilityOnce);

LiteGraph.registerNodeType(Blocks.NotificationEmail.menu, Blocks.NotificationEmail);

LiteGraph.registerNodeType(Blocks.MathAdd.menu, Blocks.MathAdd);
LiteGraph.registerNodeType(Blocks.MathSubstract.menu, Blocks.MathSubstract);
LiteGraph.registerNodeType(Blocks.MathMultiply.menu, Blocks.MathMultiply);
LiteGraph.registerNodeType(Blocks.MathDivide.menu, Blocks.MathDivide);


loadFlow = async () => {
    const response = await apiClient.Flows.read(flowId).execute();
    flowEditor.graph.configure(JSON.parse(response.data.logic));
    document.getElementById('flow-title').innerText = response.data.name;
    //console.log(JSON.parse(response.data.logic));
    flowEditor.graph.currentFlow = response.data;
    flowEditor.graph.logger = {
        info: function () { console.log("[INFO]", ...arguments) },
        warning: function () { console.log("[WARNING]", ...arguments) },
        error: function () { console.log("[ERROR]", ...arguments) },
        debug: function () { console.log("[DEBUG]", ...arguments) }
    };
    blockingLoader.hide();
    flowEditor.graph.start();
}

blockingLoader.show();
loadFlow();


/*const foo = require('./modals/create-user');
foo.show();*/
