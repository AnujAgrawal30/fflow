const ApiClient = require('../../../common/services/api-client');
const Modal = require('../js/modals/abstract');

window.apiClient = new ApiClient('development', 'FE', {
    global403ErrorManager: (error) => {
        Modal.Toast("error", error.message, 7000);
    },
    global500ErrorManager: () => {
        Modal.Toast("error", "The service is not available at the moment, please retry later", 7000);
    }
});

async function go() {
    await require('../js/modals/create-user').show(false);
    window.location.href = "/app/list-flows.html";
}

go();