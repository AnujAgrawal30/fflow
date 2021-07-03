const LiteGraph = require('../lib/litegraph');
const AbstractBlock = require('./abstract-block');

//import * as docs from "./network-incoming-webhook.md";

const debounce = require('debounce');

class NetworkIncomingWebhook extends AbstractBlock {

    static title = "Incoming Webhook";
    //static desc = docs.html;
    static desc = "TODO";
    static menu = "Network/Incoming Webhook";

    constructor(props) {

        super(props);


        this.addOutput('trigger', LiteGraph.EVENT);
        this.addOutput('body', 'object');

        this.resizable = true;

        this.addWidget("space");

        const me = this;

        this.addWidget(
            "button",
            "Config",
            null,
            debounce(
                async function(v){

                    const modal = require('../../clients_src/app/js/modals/config-incoming-webhook');

                    console.log(await modal.show(me.graph.currentFlow));

                }, 1000, true), {} );

    }

    onAdded() {
        const totalLikeMe = this.graph._nodes.reduce((acum, current) => current instanceof NetworkIncomingWebhook ? acum + 1 : 0, 0);

        if(totalLikeMe === 1)
            return;

        this.graph.remove(this);

        require('../../clients_src/app/js/modals/abstract').Toast("warning", "Only one Incoming Webhook block can be added by flow", 5000);

    }

    onConfigure() {


    }

    triggerEvent(slot = 0, body) {

        this.setOutputData(1, body);
        this.triggerSlot(slot, { eventType: "incomingWebhook", timestamp: new Date().getTime() });


    }


}

module.exports = NetworkIncomingWebhook;

