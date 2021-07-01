const LiteGraph = require('../lib/litegraph');
const AbstractBlock = require('./abstract-block');


const debounce = require('debounce');

class Wallet extends AbstractBlock {

    static title = "Get Wallet";
    static desc = "Get Wallet information";
    static menu = "Finance/Get Wallet";

    constructor(props) {

        super(props);

        this.addInput('trigger', LiteGraph.ACTION);

        this.addOutput('trigger', LiteGraph.EVENT);
        this.addOutput('balance', 'number');
        this.addOutput('currency', 'string');

        this.addProperty('wallet');


        this.resizable = true;

        this.addWidget("space");

        this.selectedWalletWidget = this.addWidget(
            "text",
            "Wallet",
            "",
            value => {});

        this.selectedWalletWidget.disabled = true;

        const me = this;

        this.addWidget(
            "button",
            "Select wallet",
            null,
            debounce(
                function(v){

                    const walletSelectModal = require('../../clients_src/app/js/modals/select-wallet');

                    walletSelectModal.show(wallet => {

                        if(!wallet)
                            return;

                        me.properties['wallet'] = wallet;
                        me.selectedWalletWidget.value = wallet.meta.title;


                    } );

                }, 1000, true), {} );

    }


    onConfigure() {

        this.selectedWalletWidget.value = this.properties['wallet'] && this.properties['wallet'].meta ? this.properties['wallet'].meta.title : "";

    }

    getOutputSchema() {
        return {
            _id: "string",
            type: "string",
            createdAt: "date",
            updatedAt: "date",
            kyc: "boolean"
        }
    }

    async onAction() {
        if(!this.properties['wallet'])
            return;

        const response = await this.graph.apiClient.Wallets.read(this.properties['wallet']._id).execute();

        this.setOutputData(1, response.data.balance);
        this.setOutputData(2, response.data.currency);

        this.triggerSlot(0, { eventType: "getWallet", timestamp: new Date().getTime(), data: response.data });

    }

}

module.exports = Wallet;

