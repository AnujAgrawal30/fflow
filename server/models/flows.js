const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const parser = require('cron-parser');
const moment = require('moment');

const publicFields = require("../plugins/public-fields");

const tagLabel = 'flowsModel';

const FlowsSchema = new mongoose.Schema({

        name: {
            type: String,
            required: [true, i18n.__('FIELD_REQUIRED')],
            minlength: [2, i18n.__('STRING_AT_LEAST', {min: 2})],
            maxlength: [200, i18n.__('STRING_AT_MUST', {max: 200})]
        },
        description: {
            type: String,
            maxlength: [600, i18n.__('STRING_AT_MUST', {max: 600})]
        },
        logic: {
            type: String,
            maxlength: 10000
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        nextCronEvent: {
            date: { type: Date },
            nodes: [{ type: Number }]
        },
        lastExecution: {
            completed: {
                type: Boolean
            },
            date: {
                type: Date
            }
        },
        status: {
            type: String,
            enum: ['inactive', 'active', 'running'],
            default: 'inactive',
            required: true
        }

    },
    {collection: 'flows', timestamps: true}
);

FlowsSchema.plugin(publicFields, [
    "_id",
    "name",
    "description",
    "logic",
    "nextCronEvent"
]);

FlowsSchema.plugin(mongooseDelete, { overrideMethods: true });

FlowsSchema.methods.refreshSchedules = function () {

    try {

        const logic = JSON.parse(this.logic);

        if (!logic.nodes)
            return;

        let closestDate = null;
        let nodes = [];

        logic.nodes.forEach(node => {

            try {

                if (!node.type.includes('Schedule/'))
                    return;

                let cron;

                if (node.type === 'Schedule/Weekly') {

                    cron = '0 ' + node.properties.atHour + ' * * ';
                    const days = [];

                    if (node.properties.sunday)
                        days.push(0);
                    if (node.properties.monday)
                        days.push(1);
                    if (node.properties.tuesday)
                        days.push(2);
                    if (node.properties.wednesday)
                        days.push(3);
                    if (node.properties.thursday)
                        days.push(4);
                    if (node.properties.friday)
                        days.push(5);
                    if (node.properties.saturday)
                        days.push(6);

                    cron += days.join(",");

                } else if (node.type === 'Schedule/Daily') {

                    cron = '0 ' + node.properties.atHour + ' * * *';

                }

                const now = moment();
                const fromDate = moment(node.properties.fromDate, 'YYYY-MM-DD').utcOffset(node.properties.utcOffset);

                const currentDate = now.isAfter(fromDate) ? now.toDate() : fromDate.toDate();

                const interval = parser.parseExpression(cron, {currentDate, iterator: true});

                const nextDate = interval.next().value.toDate();

                if (!closestDate || nextDate < closestDate) {
                    closestDate = nextDate;
                    nodes = [node.id];
                } else if (closestDate && nextDate.getTime() === closestDate.getTime()) {
                    closestDate = nextDate;
                    nodes.push(node.id);
                }

            } catch (error) {
                return;
            }
        });

        this.nextCronEvent = {
            date: closestDate,
            nodes
        }
    } catch (error) {
        utilities.logger.error("Cannot update Schedules", { tagLabel, error });
    }
};

module.exports = exports = mongoose.model('Flow', FlowsSchema);
