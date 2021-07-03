const LiteGraph = require('../lib/litegraph');
const AbstractBlock = require('./abstract-block');


const debounce = require('debounce');

class Wallet extends AbstractBlock {

    static title = "Detect Money in";
    static desc = "Triggers an event when a new transaction enters an specific Wallet";
    static menu = "Finance/Detect money in";

    constructor(props) {

        super(props);

        this.addOutput('trigger', LiteGraph.EVENT);
        this.addOutput('amount', 'number');

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


    async triggerEvent(payment) {

        this.setOutputData(1, payment.amount);
        this.triggerSlot(0, { eventType: "getWallet", timestamp: new Date().getTime(), data: payment });

    }

}

module.exports = Wallet;

