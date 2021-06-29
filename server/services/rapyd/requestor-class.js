module.exports = class Requestor {

    constructor(rootContext, endpoint, method, payload) {
        this.rootContext = rootContext;
        this.endpoint = endpoint;
        this.method = method;
        this.payload = payload;
    }

    async execute() {
        utilities.logger.debug("New Rapyd API request", {endpoint: this.endpoint, method: this.method, payload: this.payload});
        return await this.rootContext.makeRequest(this.endpoint, this.method, this.payload);
    }
};