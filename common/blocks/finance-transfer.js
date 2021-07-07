const LiteGraph = require('../lib/litegraph');
const AbstractBlock = require('./abstract-block');

const debounce = require('debounce');

class Wallet extends AbstractBlock {

    static title = "Transfer between wallets";
    static desc = "Transfers funds in real time between a debited wallet and a credited wallet";
    static menu = "Finance/Transfer between wallets";

    constructor(props) {

        super(props);

        this.addInput('trigger', LiteGraph.ACTION);
        this.addInput('amount', 'number');

        this.addOutput('trigger', LiteGraph.EVENT);

        this.addProperty('debitedWallet');
        this.addProperty('creditedWallet');
        this.addProperty('amount');

        //this.size = [250, 90];

        this.resizable = true;


        const me = this;

        this.addWidget("space");

        this.selectedAmountWidget = this.addWidget(
            "number",
            "Amount",
            0,
            value => { this.properties['amount'] = value });
        this.addWidget("space")

        this.selectedDebitedWalletWidget = this.addWidget(
            "text",
            "From",
            "",
            value => {});

        this.selectedDebitedWalletWidget.disabled = true;

        this.addWidget(
            "button",
            "Select debited wallet",
            null,
            debounce(
                function(v){

                    const walletSelectModal = require('../../clients_src/app/js/modals/select-wallet');

                    walletSelectModal.show(wallet => {

                        if(!wallet)
                            return;

                        me.properties['debitedWallet'] = wallet;
                        me.selectedDebitedWalletWidget.value = wallet.meta.title;

                    } );

                }, 1000, true), {} );

        this.addWidget("space");

        this.selectedCreditedWalletWidget = this.addWidget(
            "text",
            "To",
            "",
            value => {});

        this.selectedCreditedWalletWidget.disabled = true;



        this.addWidget(
            "button",
            "Select credited wallet",
            null,
            debounce(
                function(v){

                    const walletSelectModal = require('../../clients_src/app/js/modals/select-wallet');

                    walletSelectModal.show(wallet => {

                        if(!wallet)
                            return;

                        me.properties['creditedWallet'] = wallet;
                        me.selectedCreditedWalletWidget.value = wallet.meta.title;

                    } );

                }, 1000, true), {} );



    }


    onConfigure() {

        this.selectedAmountWidget.value = this.properties['amount'] === undefined ? 0 : this.properties['amount'];
        this.selectedDebitedWalletWidget.value = this.properties['debitedWallet'] && this.properties['debitedWallet'].meta ? this.properties['debitedWallet'].meta.title : "";
        this.selectedCreditedWalletWidget.value = this.properties['creditedWallet'] && this.properties['creditedWallet'].meta ? this.properties['creditedWallet'].meta.title : "";

    }

    onConnectionsChange(io, slot, connected, linkInfo, inputInfo) {

        if(io === 1 && slot === 1 && connected && linkInfo) {
            //const originNode = this.graph.getNodeById(linkInfo.origin_id);
            this.selectedAmountWidget.disabled = true;
            this.selectedAmountWidget.type = "text";
            this.selectedAmountWidget.value = 'from input';

        }
        else if(io === 1 && !connected && slot === 1 ) {
            this.selectedAmountWidget.disabled = false;
            this.selectedAmountWidget.type = "number";
            this.selectedAmountWidget.value = 0;
        }


    }

    async onAction() {


        if(!this.properties['debitedWallet'] || !this.properties['creditedWallet'])
            return;

        const amount = this.getInputData(1) === undefined ? this.selectedAmountWidget.value : parseFloat(this.getInputData(1));


        if(typeof amount !=='number' || amount <= 0)
            return;


        const response = await this.graph.apiClient.Transfers.create({
            debitedWallet: this.properties['debitedWallet']._id,
            creditedWallet: this.properties['creditedWallet']._id,
            amount: Math.round(amount * 100) / 100
        }).execute();

        this.triggerSlot(0, { timestamp: new Date().getTime(), data: response.data });


    }

}

module.exports = Wallet;

