const Wallets = require('../../models/wallets');
const moment = require('moment');

const tagLabel = 'saveWallet';

module.exports = async (req, res) => {

    try {

        const wallet = new Wallets({ ...req.body, owner: req.locals.user._id });

        await wallet.validate();

        const exitingWalletWithEmail = await Wallets.findOne({ 'contact.email': wallet.contact.email });

        if(exitingWalletWithEmail)
            return res.forbidden(i18n.__('EMAIL_IS_NOT_UNIQUE'));

        const exitingWalletWithPhoneNumber = await Wallets.findOne({ 'contact.phoneNumber': wallet.contact.phoneNumber });

        if(exitingWalletWithPhoneNumber)
            return res.forbidden(i18n.__('PHONE_IS_NOT_UNIQUE'));


        const rapydPayload = {
            email: wallet.contact.email,
            first_name: wallet.contact.firstname ? wallet.contact.firstname : wallet.contact.companyName,
            last_name: wallet.contact.surname,
            phone_number: wallet.contact.phoneNumber,
            ewallet_reference_id: wallet._id,
            type: wallet.type,
            contact: {
                email: wallet.contact.email,
                first_name: wallet.contact.firstname,
                last_name: wallet.contact.surname,
                phone_number: wallet.contact.phoneNumber,
                contact_type: wallet.type === 'person' ? 'personal' : 'business'
            }
        };

        if(wallet.contact.identificationType)
            rapydPayload.contact.identification_type = wallet.contact.identificationType;
        if(wallet.contact.identificationNumber)
            rapydPayload.contact.identification_number = wallet.contact.identificationNumber;
        if(wallet.contact.country)
            rapydPayload.contact.country = wallet.contact.country;
        if(wallet.contact.nationality)
            rapydPayload.contact.nationality = wallet.contact.nationality;
        if(wallet.contact.birthday)
            rapydPayload.contact.date_of_birth = moment(wallet.contact.birthday).format('MM/DD/YYYY');


        const response = await rapydClient.Wallets.create(rapydPayload).execute();

        wallet.rapydId = response.data.id;

        wallet.sync(response.data);

        await wallet.save();

        res.resolve(wallet);


    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};