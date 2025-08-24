const Joi = require("joi");


//const listingSchema = Joi.object({
module.exports.listingSchema = Joi.object({
    // meaning that we here should have an object named listing ( inside Joi.object({}) )
    // listing : Joi.object().required()               // meaning that whenever we get a request, of the sort, we must have an object called listing which is required. Inside this object we can define our parameters of the object we get
    listing : Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().allow("", null)
        })
    }).required() 
});