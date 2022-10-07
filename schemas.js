const Joi = require("joi");

module.exports.noteSchema = Joi.object({
    notes: Joi.object({
        title: Joi.string().required(),
        text: Joi.string().required()
    }).required()
});
