const IBAN = require('iban');
const BICFromIBAN = require ("bic-from-iban");
const moment = require('moment');

const Beneficiaries = require('../../models/beneficiaries');

const tagLabel = 'beneficiarySave';

module.exports = async (req, res) => {

    try {

        const beneficiary = new Beneficiaries({ ...req.body, owner: req.locals.user._id });

        await beneficiary.validate();

        const iban = beneficiary.iban;

        if(!IBAN.isValid(iban))
            return res.badRequest({ iban: 'Incorrect IBAN format' });

        const country = iban.substring(0, 2);

        if(api.config.client.supportedCountries.indexOf(country) < 0)
            return res.forbidden('At the moment we do not support IBANs from that country');

        const supportedMethods = await rapydClient
            .Payouts
            .SupportedMethods(country, beneficiary.entityType, beneficiary.currency, 'bank').read().execute();

        const payMethodType = ((country.toLowerCase()) + "_general_bank");

        const bankwireMethod = supportedMethods.data.find(el => el.payout_method_type === payMethodType && el.status === 1);


        if(!bankwireMethod)
            return res.forbidden('At the moment we do not support IBANs from that country');

        const reqFieldsResponse = await rapydClient
            .Payouts
            .RequiredFields(country, country, req.locals.user.entityType, beneficiary.entityType, 5000, beneficiary.currency).read(payMethodType)
            .execute();


        const requiredFields = reqFieldsResponse.data.beneficiary_required_fields;

        let BIC = BICFromIBAN.getBIC(iban);
        //Probably fake test IBAN
        if(!BIC && process.env.ENV === 'DEVELOPING')
            BIC = 'FAKE' + iban.substring(0,2) + 'XX001';

        const rapydPayload = {
            category: 'bank',
            payment_type: requiredFields.find(el => el.name==='payment_type').regex,
            country,
            currency: beneficiary.currency,
            entity_type: beneficiary.entityType,
            iban,
            bic_swift: BIC,
            city: beneficiary.city,
            address: beneficiary.address
        };

        if(beneficiary.entityType === 'company')
            rapydPayload.company_name = beneficiary.companyName;
        else if(beneficiary.entityType === 'individual') {
            rapydPayload.first_name = beneficiary.firstname;
            rapydPayload.last_name = beneficiary.surname;
            rapydPayload.date_of_birth = moment(beneficiary.birthday).format('MM/DD/YYYY');
        }

        const response = await rapydClient.Payouts.Beneficiaries
            .create(rapydPayload)
            .execute();

        beneficiary.rapydId = response.data.id;
        beneficiary.payMethodType = payMethodType;

        await beneficiary.save();

        res.resolve(beneficiary);


    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};