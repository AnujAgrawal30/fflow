const Beneficiaries = require('../../models/beneficiaries');

const tagLabel = 'getBeneficiary';

module.exports = async (req, res) => {

    try {

        const beneficiary = await Beneficiaries.findOne({ _id: req.params.id, owner: req.locals.user._id });

        if(!beneficiary)
            return res.notFound();

        res.resolve(beneficiary);

    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};