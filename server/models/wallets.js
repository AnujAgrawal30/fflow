const mongoose = require('mongoose');
const moment = require('moment');
const validator = require('validator');
const mongooseDelete = require('mongoose-delete');

const publicFields = require("../plugins/public-fields");

const WalletsSchema = new mongoose.Schema({

        meta: {
            title: {
                type: String,
                required: [true, i18n.__('FIELD_REQUIRED')],
                minlength: [2, i18n.__('STRING_AT_LEAST', {min: 2})],
                maxlength: [200, i18n.__('STRING_AT_MUST', {max: 200})]
            },
            description: {
                type: String,
                maxlength: [600, i18n.__('STRING_AT_MUST', {max: 600})]
            },
        },
        balance: {
            type: Number,
            required: true,
            default: 0
        },
        currency: {
            type: String,
            enum: ['EUR', 'USD'],
            default: 'EUR',
            required: true
        },
        verificationStatus: {
            type: String
        },
        status: {
            type: String
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rapydId: {
            type: String
        },
        type: {
            type: String,
            enum: ['person', 'company'],
            required: true
        },
        kyc: {
            type: Boolean,
            default: false,
            required: true
        },
        contact: {
            email: {
                type: String,
                required: [true, i18n.__('FIELD_REQUIRED')],
                validate: [ validator.isEmail, i18n.__('INVALID_EMAIL')]
            },
            firstname: {
                type: String,
                minlength: [1, i18n.__('STRING_AT_LEAST', {min: 1})],
                maxlength: [100, i18n.__('STRING_AT_MUST', {max: 100})]
            },
            surname: {
                type: String,
                minlength: [1, i18n.__('STRING_AT_LEAST', {min: 1})],
                maxlength: [100, i18n.__('STRING_AT_MUST', {max: 100})]
            },
            companyName: {
                type: String,
                minlength: [1, i18n.__('STRING_AT_LEAST', {min: 1})],
                maxlength: [100, i18n.__('STRING_AT_MUST', {max: 100})]
            },
            phoneNumber: {
                type: String,
                validate: [/^\+?[1-9]\d{6,14}$/, i18n.__('INVALID_FIELD')],
                required: [true, i18n.__('FIELD_REQUIRED')]
            },
            identificationType: {
                type: String,
                minlength: [2, i18n.__('STRING_AT_LEAST', {min: 2})],
                maxlength: [2, i18n.__('STRING_AT_MUST', {max: 2})],
            },
            identificationNumber: {
                type: String,
                maxlength: [100, i18n.__('STRING_AT_MUST', {max: 100})],
            },
            country: {
                type: String,
                minlength: [2, i18n.__('STRING_AT_LEAST', {min: 2})],
                maxlength: [2, i18n.__('STRING_AT_MUST', {max: 2})],
                required: [true, i18n.__('FIELD_REQUIRED')]
            },
            city: {
                type: String,
                minlength: [2, i18n.__('STRING_AT_LEAST', {min: 2})],
                maxlength: [60, i18n.__('STRING_AT_MUST', {max: 60})],
                required: [true, i18n.__('FIELD_REQUIRED')]
            },
            address: {
                type: String,
                minlength: [2, i18n.__('STRING_AT_LEAST', {min: 2})],
                maxlength: [120, i18n.__('STRING_AT_MUST', {max: 120})],
                required: [true, i18n.__('FIELD_REQUIRED')]
            },
            birthday: {
                type: Date,
                set: v => v ? moment(v, 'YYYY-MM-DD').toDate() : null
            },
            nationality: {
                type: String,
                minlength: [2, i18n.__('STRING_AT_LEAST', {min: 2})],
                maxlength: [2, i18n.__('STRING_AT_MUST', {max: 2})],
            }
        }

    },
    {collection: 'wallets', timestamps: true}
);

WalletsSchema.plugin(publicFields, [
    "_id", "meta", "contact", "type", "kyc", "balance", "currency"
]);

WalletsSchema.plugin(mongooseDelete, {overrideMethods: true});

WalletsSchema.pre('validate', function (next) {

    if(this.type === 'person' && !this.contact.firstname)
    {
        this.invalidate('contact.firstname', i18n.__('FIELD_REQUIRED'));
    }
    else if(this.type === 'person' && !this.contact.surname)
    {
        this.invalidate('contact.surname', i18n.__('FIELD_REQUIRED'));
    }
    else if(this.type === 'person' && !this.contact.birthday)
    {
        this.invalidate('contact.birthday', i18n.__('FIELD_REQUIRED'));
    }
    else if(this.type === 'company' && !this.contact.companyName)
        this.invalidate('contact.companyName', i18n.__('FIELD_REQUIRED'));


    next();

});

WalletsSchema.methods.sync = function (payload) {

    const account = payload.accounts ? payload.accounts.find(el=> el.currency === this.currency) : null;

    this.balance = account ? account.balance : 0;

    this.verificationStatus = payload.verificationStatus;
    this.status = payload.status;

};

module.exports = exports = mongoose.model('Wallet', WalletsSchema);
