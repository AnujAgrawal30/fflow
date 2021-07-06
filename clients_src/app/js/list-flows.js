const ApiClient = require('../../../common/services/api-client');
const Modal = require('../js/modals/abstract');
const newFlowModal = require('../js/modals/create-flow');
const Table = require('../js/lib/table');
const moment = require('moment');

window.apiClient = new ApiClient('development', 'FE', {
    global403ErrorManager: (error) => {
        Modal.Toast("error", error.message, 7000);
    },
    global500ErrorManager: () => {
        Modal.Toast("error", "The service is not available at the moment, please retry later", 7000);
    }
});

document.getElementById('new-flow').addEventListener('click', async () => {
    const flow = await newFlowModal.show();

    if(flow)
        window.location.href = "/app/edit-flow/" + flow._id;
});

async function go() {

    const response = await apiClient.Flows.list().execute();


    if(response.data.length > 0) {
        const options = {
            element: document.getElementById("table"),
            data: response.data.map(flow => ({
                Name: flow.name,
                'Created at': moment(flow.createdAt).format('DD/MM/YYYY'),
                Status: flow.status,
                ' ': '<a href="/app/edit-flow/' + flow._id + '">edit</a>'
            }))
        };

        const table = new Table(options);

        table.view();

        setTimeout(()=>{
            let tables = document.getElementsByClassName("vanillajs-table");
            for (let i = 0; i < tables.length; i++) {
                tables[i].resize();
            }
        }, 100);

    }

    else {
        document.getElementById('empty-state').style.display = 'block';
    }



}

go();