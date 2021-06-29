const mongoose = require('mongoose');
const moment = require('moment');
const validator = require('validator');
const publicFields = require("../plugins/public-fields");
const authCapable = require("../plugins/authentication-capable");

const UsersSchema = new mongoose.Schema({

        firstname: {
            type: String,
            required: [true, i18n.__('FIELD_REQUIRED')],
            minlength: [2, i18n.__('STRING_AT_LEAST', { min: 2 })],
            maxlength: [120, i18n.__('STRING_AT_MUST', { min: 120 })],
        },
        surname: {
            type: String,
            minlength: [2, i18n.__('STRING_AT_LEAST', { min: 2 })],
            maxlength: [120, i18n.__('STRING_AT_MUST', { min: 120 })],
        },
        companyName: {
            type: String,
            minlength: [2, i18n.__('STRING_AT_LEAST', { min: 2 })],
            maxlength: [120, i18n.__('STRING_AT_MUST', { min: 120 })],
        },
        email: {
            type: String,
            required: [true, i18n.__('FIELD_REQUIRED')],
            unique: [true, i18n.__('EMAIL_IS_NOT_UNIQUE')],
            validate: [ validator.isEmail, i18n.__('INVALID_EMAIL')]
        },
        birthday: {
            type: Date,
            required: [true, i18n.__('FIELD_REQUIRED')],
            set: v => moment(v, 'YYYY-MM-DD').toDate()
        },
        address: {
            type: String,
            minlength: [2, i18n.__('STRING_AT_LEAST', { min: 2 })],
            maxlength: [120, i18n.__('STRING_AT_MUST', { min: 120 })],
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        phoneNumber: {
            type: String,
            validate: [/^\+?[1-9]\d{6,14}$/, i18n.__('INVALID_FIELD')],
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        city: {
            type: String,
            minlength: [2, i18n.__('STRING_AT_LEAST', { min: 2 })],
            maxlength: [120, i18n.__('STRING_AT_MUST', { min: 120 })],
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        country: {
            type: String,
            minlength: [2, i18n.__('STRING_AT_LEAST', {min: 2})],
            maxlength: [2, i18n.__('STRING_AT_MUST', {max: 2})],
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        entityType: {
            type: String,
            enum: ['individual', 'company'],
            default: 'individual'
        }

    },
    {collection: 'users', timestamps: true}
);

UsersSchema.plugin(authCapable);

UsersSchema.plugin(publicFields, [
    "_id",
    "firstname",
    "surname",
    "companyName",
    "email",
]);


UsersSchema.pre('validate', function (next) {

    if(this.entityType === 'individual' && (!this.firstname || !this.surname))
    {
        this.invalidate('firstname', i18n.__('FIELD_REQUIRED'));
        this.invalidate('surname', i18n.__('FIELD_REQUIRED'));
    }
    else if(this.entityType === 'company' && !this.companyName)
        this.invalidate('companyName', i18n.__('FIELD_REQUIRED'));


    next();

});

module.exports = exports = mongoose.model('User', UsersSchema);
