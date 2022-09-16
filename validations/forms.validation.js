const { check, body} = require('express-validator');
const mongoose = require("mongoose");
const { Forms } = require('../models');
const labelmsg = require('../labels/response.labels');
const { verifySignUp } = require('../middleware/verifySignUp');


exports.Create = () => {
    return [
        body('form_name').notEmpty().withMessage(labelmsg.name),
        body('form_key').notEmpty().withMessage(labelmsg.form_key).custom(value => {
            return Forms.findOne({ 'form_key': value }).then(res => {
                if (res) {
                    return Promise.reject(labelmsg.keyalreadyExists);
                }
            });
        }),
        body('fields').isArray().notEmpty().withMessage("Please pass the form fields"),
        body('fields.*.field_label', `field's label is required`).notEmpty(),
        body('fields.*.field_name', `field's name is required`).notEmpty(),
        body('fields.*.field_type', `field's type is required`).notEmpty(),

    ];
};

exports.Update = () => {
    return [
        body('_id').notEmpty().withMessage(labelmsg.formid)
    ];
};


exports.SaveFormDetails = () => {
    return [
        body('_id').notEmpty().withMessage(labelmsg.formid),
        body('form_key').notEmpty().withMessage(labelmsg.form_key),
        body('fields').isArray().notEmpty().withMessage("Please pass the form fields"),
        body('fields.*._id', `${labelmsg.fieldid}`).notEmpty(),
        body('fields.*.field_label', `field's label is required`).notEmpty(),
        body('fields.*.field_name', `field's name is required`).notEmpty(),
        body('fields.*.field_type', `field's type is required`).notEmpty(),
        body('fields.*.value', `field's value is required`).optional().notEmpty(),
    ];
};
exports.SaveFormDetailsNew = () => {
    return [
        // body('form_id').notEmpty().withMessage(labelmsg.formid),
        // body('form_key').notEmpty().withMessage(labelmsg.form_key),
        // body('fields').isArray().notEmpty().withMessage("Please pass the form fields"),
        // body('fields.*._id', `${labelmsg.fieldid}`).notEmpty(),
        // body('fields.*.field_label', `field's label is required`).notEmpty(),
        // body('fields.*.field_name', `field's name is required`).notEmpty(),
        // body('fields.*.field_type', `field's type is required`).notEmpty(),
        // body('fields.*.value', `field's value is required`).optional().notEmpty(),
    ];
};

exports.UpdateFormDetails = () => {
    return[
        // body('form_id').notEmpty().withMessage(labelmsg.formid),
        // body('entry_id').notEmpty().withMessage(labelmsg.entryid),
    ]
}
