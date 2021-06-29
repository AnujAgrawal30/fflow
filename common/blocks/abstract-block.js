class AbstractBlock {

    constructor() {

        //this.schema = {};

    }


/*    onConnectionsChange(io, slot, connected, linkInfo, inputInfo) {

        if(io === 1 && connected && linkInfo) {
            const originNode = this.graph.getNodeById(linkInfo.origin_id);
            if(typeof originNode.getOutputSchema === "function" && typeof this.setInputSchema === 'function')
                this.setInputSchema(originNode.getOutputSchema());
        }
        else if(io === 1 && !connected && typeof this.setInputSchema === 'function') {
            this.setInputSchema(null);
        }


    }

    getOutputSchema() {
        return this.schema;
    }*/

}

module.exports = AbstractBlock;