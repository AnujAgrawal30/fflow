const mongoose = require('mongoose');

const publicFields = require("../plugins/public-fields");

const TransactionsSchema = new mongoose.Schema({

        amount: {
            type: Number,
            required: true
        },
        debitedWallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true
        },
        creditedWallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Wallet'
        },
        status: {
            type: String,
            //pending, completed, declined, cancel
            //enum: ['PEN', 'CLO', 'DEC', 'CAN'],
            //default: 'PEN'
        },
        rapydId: {
            type: String
        },
        type: {
            type: String,
            enum: ['transfer', 'money-in', 'money-out'],
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        beneficiary: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Beneficiary'
        }

    },
    {collection: 'transactions', timestamps: true}
);

TransactionsSchema.plugin(publicFields, [
    "_id", "debitedWallet", "creditedWallet", "status", "type", "createdAt", "updatedAt", "amount"
]);


module.exports = exports = mongoose.model('Transaction', TransactionsSchema);
