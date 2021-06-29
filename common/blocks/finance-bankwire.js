const LiteGraph = require('../lib/litegraph');
const AbstractBlock = require('./abstract-block');


const debounce = require('debounce');

class Wallet extends AbstractBlock {

    static title = "Bankwire";
    static desc = "Makes a deposit to a bank account from a selected debited wallet";

    constructor(props) {

        super(props);

        this.addInput('trigger', LiteGraph.ACTION);
        this.addInput('amount', 'number');

        this.addOutput('trigger', LiteGraph.EVENT);

        this.addProperty('debitedWallet');
        this.addProperty('beneficiary');
        this.addProperty('amount');

        this.resizable = true;

        this.addWidget("space");

        this.selectedAmountWidget = this.addWidget(
            "number",
            "Amount",
            0,
            value => { this.properties['amount'] = value });

        this.addWidget("space");

        this.selectedDebitedWalletWidget = this.addWidget(
            "text",
            "Wallet",
            "",
            value => {});

        this.selectedDebitedWalletWidget.disabled = true;

        const me = this;

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

        this.selectedBeneficiaryWidget = this.addWidget(
            "text",
            "Beneficiary",
            "",
            value => {});

        this.selectedBeneficiaryWidget.disabled = true;


        this.addWidget(
            "button",
            "Select beneficiary",
            null,
            debounce(
                function(v){

                    const beneficiarySelectModal = require('../../clients_src/app/js/modals/select-beneficiary');

                    beneficiarySelectModal.show(beneficiary => {

                        if(!beneficiary)
                            return;

                        me.properties['beneficiary'] = beneficiary;
                        me.selectedBeneficiaryWidget.value = beneficiary.entityType === 'company' ? beneficiary.companyName : beneficiary.firstname;


                    } );

                }, 1000, true), {} );


    }


    onConfigure() {

        this.selectedAmountWidget.value = this.properties['amount'] === undefined ? 0 : this.properties['amount'];
        this.selectedDebitedWalletWidget.value = this.properties['debitedWallet'] && this.properties['debitedWallet'].meta ? this.properties['debitedWallet'].meta.title : "";
        this.selectedBeneficiaryWidget.value = this.properties['beneficiary'] ? (this.properties['beneficiary'].entityType === 'company' ? this.properties['beneficiary'].companyName : this.properties['beneficiary'].firstname ) : "";

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
        if(!this.properties['debitedWallet'] || !this.properties['beneficiary'])
            return;

        const amount = this.getInputData(1) === undefined ? this.selectedAmountWidget.value : parseFloat(this.getInputData(1));


        if(typeof amount !=='number' || amount <= 0)
            return;


        const response = await apiClient.Payouts.Bankwire.create({
            beneficiary: this.properties['beneficiary']._id,
            debitedWallet: this.properties['debitedWallet']._id,
            amount
        }).execute();


        this.triggerSlot(0, { eventType: "doBankwire", timestamp: new Date().getTime(), data: response.data });

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

}

module.exports = Wallet;

