const AbstractBlock = require('./abstract-block');

class AbstractTimeBlock extends AbstractBlock {

    constructor() {
        super();
    }

    triggerEvent(slot = 0) {
        this.triggerSlot(slot, { eventType: "schedule", timestamp: new Date().getTime() });
    }

}

module.exports = AbstractTimeBlock;