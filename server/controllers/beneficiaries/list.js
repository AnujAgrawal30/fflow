const Beneficiaries = require('../../models/beneficiaries');

const tagLabel = 'listBeneficiaries';

module.exports = async (req, res) => {

    try {

        const beneficiaries = await Beneficiaries.find({ owner: req.locals.user._id });

        res.resolve(beneficiaries);


    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};