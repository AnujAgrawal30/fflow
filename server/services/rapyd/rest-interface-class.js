const Requestor = require('./requestor-class');


const prepareURL = (url, _params) => {

    let params;
    if(typeof _params === 'string')
        params = [_params];
    else
        params = _params;

    return url.replace(/{(\d+)}/g, function (match, number) {
        return typeof params[number] !== 'undefined'
            ? params[number]
            : match
            ;
    })

};

module.exports = class RestInterface {

    constructor(rootContext, createEndpoint, readEndpoint, editEndpoint, listEndpoint) {
        this.rootContext = rootContext;
        this.createEndpoint = createEndpoint;
        this.readEndpoint = readEndpoint;
        this.editEndpoint = editEndpoint;
        this.listEndpoint = listEndpoint;
    }

    create(payload) {
        return new Requestor(this.rootContext, this.createEndpoint, 'POST', payload);
    }

    read(params = []) {

        return new Requestor(this.rootContext, prepareURL(this.readEndpoint, params), 'GET');

    }

    list(payload) {
        return new Requestor(this.rootContext, this.listEndpoint, 'GET', payload);
    }

    update(params = [], payload) {
        return new Requestor(this.rootContext, prepareURL(this.editEndpoint, params), 'PUT', payload);
    }

};