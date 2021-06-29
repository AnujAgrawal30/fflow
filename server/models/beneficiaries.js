const moment = require('moment');
const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const publicFields = require("../plugins/public-fields");

const BeneficiariesSchema = new mongoose.Schema({

        rapydId: {
            type: String
        },
        payMethodType: {
            type: String
        },
        iban: {
            type: String,
            set: v => v.toUpperCase().replace(/ /g,''),
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        country: {
            type: String,
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        entityType: {
            type: String,
            enum: ['individual', 'company'],
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        currency: {
            type: String,
            default: 'EUR',
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        category: {
            type: String,
            enum: ['bank'],
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        firstname: {
            type: String,
            minlength: [2, i18n.__('STRING_AT_LEAST', { min: 2 })],
            maxlength: [120, i18n.__('STRING_AT_MUST', { min: 120 })]
        },
        surname: {
            type: String,
            minlength: [2, i18n.__('STRING_AT_LEAST', { min: 2 })],
            maxlength: [120, i18n.__('STRING_AT_MUST', { min: 120 })]
        },
        companyName: {
            type: String,
            minlength: [2, i18n.__('STRING_AT_LEAST', { min: 2 })],
            maxlength: [120, i18n.__('STRING_AT_MUST', { min: 120 })]
        },
        address: {
            type: String,
            minlength: [2, i18n.__('STRING_AT_LEAST', { min: 2 })],
            maxlength: [120, i18n.__('STRING_AT_MUST', { min: 120 })],
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        birthday: {
            type: Date,
            set: v => v ? moment(v, 'YYYY-MM-DD').toDate() : null
        },
        city: {
            type: String,
            minlength: [2, i18n.__('STRING_AT_LEAST', { min: 2 })],
            maxlength: [120, i18n.__('STRING_AT_MUST', { min: 120 })],
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }

    },
    { collection: 'beneficiaries', timestamps: true }
);

BeneficiariesSchema.plugin(publicFields, [
    "_id",
    "iban",
    "entityType",
    "currency",
    "category",
    "firstname",
    "surname",
    "companyName",
    "address",
    "city",
    "country"
]);

BeneficiariesSchema.pre('validate', function (next) {

    if(this.entityType === 'individual' && (!this.firstname || !this.surname))
    {
        this.invalidate('firstname', i18n.__('FIELD_REQUIRED'));
        this.invalidate('surname', i18n.__('FIELD_REQUIRED'));
    }
    else if(this.entityType === 'company' && !this.companyName)
        this.invalidate('companyName', i18n.__('FIELD_REQUIRED'));


    next();

});

BeneficiariesSchema.plugin(mongooseDelete, { overrideMethods: true });


module.exports = exports = mongoose.model('Beneficiary', BeneficiariesSchema);
