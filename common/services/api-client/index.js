const axios = require('axios');

const RestInterface = require('./rest-interface-class');

const baseURLTplFEDev = "/api";
const baseURLTplFEProd = "TODO";

const baseURLTplBEDev = "http://127.0.0.1:2022/api";
const baseURLTplBEProd = "TODO";


module.exports = class ApiClient {

    constructor(env, end, options) {

        this.env = env.toLowerCase();

        this.runningRequests = 0;

        if(end === 'FE') {
            const rawSession = localStorage.getItem('fflowSession')

            if (rawSession)
                this.session = JSON.parse(rawSession);
        }

        this.baseURL = end === 'FE' ? env === 'production' ? baseURLTplFEProd : baseURLTplFEDev : env === 'production' ? baseURLTplBEProd : baseURLTplBEDev;

        this.end = end;

        this.global403ErrorManager = options && options.global403ErrorManager ? options.global403ErrorManager : null;
        this.global500ErrorManager = options && options.global500ErrorManager ? options.global500ErrorManager : null;

        //API METHODS
        this.Status = (new RestInterface(this, null, '/v1/status')).setPublic({create: true});
        this.Users = new RestInterface(this, '/v1/users', '/v1/users/{0}');
        this.Auth = {
            Login: (new RestInterface(this, '/v1/auth/login')).setPublic({create: false}),
            Logout: new RestInterface(this, '/v1/auth/logout')
        };
        this.Flows = new RestInterface(this, '/v1/flows', '/v1/flows/{0}', '/v1/flows/{0}', '/v1/flows', '/v1/flows/{0}');
        this.Wallets = new RestInterface(this, '/v1/wallets', '/v1/wallets/{0}', null, '/v1/wallets');
        this.RPCGetPublicWallet = new RestInterface(this, null, '/v1/rpc-public-wallet/{0}');
        this.Checkout = new RestInterface(this, '/v1/checkout');
        this.Transfers = new RestInterface(this, '/v1/transfers');

        this.Payouts = {
            Beneficiaries: new RestInterface(this, '/v1/beneficiaries', '/v1/beneficiaries/{0}', null, '/v1/beneficiaries'),
            Bankwire: new RestInterface(this, '/v1/money-out-bankwire'),
        };

        this.Tools = {
            SendEmailFromFlow: new RestInterface(this, '/v1/tools/send-email-from-flow')
        };

        this.Checkout = new RestInterface(this, '/v1/checkout');

    };

    setSession(session) {

        if(!session){
            this.session = null;
            return this.end === 'FE' && localStorage.removeItem('fflowSession');
        }

        this.session = session;
        this.end === 'FE' && localStorage.setItem('fflowSession', JSON.stringify(session));

    }

    getSession() {
        return this.session;
    }

    async makeRequest(endpoint, method, payload, isPublic) {

        const me = this;

        this.runningRequests++;

        try {

            const query = (method === 'GET' && payload ? '?' + me._serialize(payload) : '')
            const url = me.baseURL + endpoint + query;

            const response = await axios({
                headers: me._getHeaders(!isPublic),
                url,
                method,
                data: payload,
                timeout: 15000
            });

            this.runningRequests--;

            if (!response.data || response.data.error)
                return Promise.reject();

            if (this.end === 'FE' && endpoint === '/v1/auth/login' && method === 'POST') {
                this.setSession(response.data.data);
            } else if (this.end === 'FE' && endpoint === '/v1/auth/logout' && method === 'POST') {
                this.setSession(null);
            }

            return response.data;
        } catch (error) {

            this.runningRequests--;

            error.response.status === 403 && this.global403ErrorManager && this.global403ErrorManager(error.response.data);
            error.response.status === 500 && this.global500ErrorManager && this.global500ErrorManager();

            return Promise.reject(error.response ? error.response.data : error);
        }

    };

    _serialize(obj) {
        const str = [];

        for (let p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }

        return str.join("&");
    }

    _getHeaders(privateHeaders = false) {

        const headers = {};

        headers['Content-Type'] = 'application/json';

        headers['timestamp'] = (Math.floor(new Date().getTime() / 1000) - 10).toString();

        if (privateHeaders)
            headers['x-auth-token'] = this.getSession() && this.getSession().token ? this.getSession().token : null;

        return headers;

    }

};