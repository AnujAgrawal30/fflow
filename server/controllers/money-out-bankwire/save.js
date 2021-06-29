const moment = require('moment');

const Transactions = require('../../models/transactions');
const Beneficiaries = require('../../models/beneficiaries');
const Wallets = require('../../models/wallets');

const tagLabel = 'saveMoneyOutBankwire';

module.exports = async (req, res) => {

    try {

        const transaction = new Transactions({...req.body, type: 'money-out', owner: req.locals.user.id });

        await transaction.validate();

        const debitedWallet = await Wallets.findOne({ _id: transaction.debitedWallet, owner: req.locals.user._id });

        if(!debitedWallet)
            return res.forbidden('Debited wallet is missing');

        const beneficiary = await Beneficiaries.findOne({ _id: transaction.beneficiary, owner: req.locals.user._id, category: 'bank' });

        if(!beneficiary)
            return res.forbidden('Beneficiary is missing');


        /*        const reqFieldsResponse = await rapydClient
                    .Payouts
                    .RequiredFields(debitedWallet.contact.country, beneficiary.country, req.locals.user.entityType, beneficiary.entityType, 5000, beneficiary.currency)
                    .read(beneficiary.payMethodType)
                    .execute();


                const requiredFields = reqFieldsResponse.data.beneficiary_required_fields;

                console.log("Z>>>",
                    requiredFields,
                    debitedWallet.contact.country,
                    beneficiary.country,
                    debitedWallet.type,
                    beneficiary.entityType,
                    transaction.amount,
                    beneficiary.currency, await rapydClient.Payouts.Beneficiaries.read(beneficiary.rapydId).execute());*/


        const sender = {
            city: debitedWallet.contact.city,
            address: debitedWallet.contact.address
        };

        if(debitedWallet.type === 'company') {
            sender.name = debitedWallet.contact.companyName;
        } else {
            sender.first_name = debitedWallet.contact.firstname;
            sender.last_name = debitedWallet.contact.surname;
            sender.date_of_birth = moment(debitedWallet.contact.birthday).format('DD/MM/YYYY');
        }

        await rapydClient.Payouts.Beneficiaries.read(beneficiary.rapydId).execute();


        const rapydPayload = {
            "beneficiary": beneficiary.rapydId,
            "beneficiary_country": beneficiary.country,
            "beneficiary_entity_type": beneficiary.entityType,
            "payout_method_type": beneficiary.payMethodType,
            "ewallet": debitedWallet.rapydId,
            "payout_amount": transaction.amount,
            "payout_currency": debitedWallet.currency,
             sender,
            "sender_country": debitedWallet.contact.country,
            "sender_currency": debitedWallet.currency,
            "sender_entity_type": debitedWallet.type === 'person' ? 'individual' : 'company',
        };

        //rapydPayload.sender_payment_type = 'priority';
        //rapydPayload.sender_name = debitedWallet.contact.companyName;

        //console.log(rapydPayload);

        const transResponse = await rapydClient.Payouts.Bankwire.create(rapydPayload).execute();

        transaction.rapydId = transResponse.data.id;
        transaction.status = transResponse.data.status;

        await transaction.save();

        res.resolve(transaction);


    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};