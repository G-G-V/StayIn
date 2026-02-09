const Listing = require("./models/listing.js");

const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.user);
    //
    // console.log(req);
    // console.log("//////////")
    // console.log(req.path)
    // console.log(req.stack)
    //
    // console.log(req.path, "..", req.originalUrl);                                     // for post-login Path, to conveniently redirect the user to where they came from after signing them in.
    // we only need to store the path and return the user to same, only if they were not initially not logged in, otherwise if there were logged in then no need to store the originalUrl in the req object to redirect them.
    if(!req.isAuthenticated()) {
        // saving redirectUrl
        req.session.redirectUrl = req.originalUrl;                                      // creating a new parameter in the session object in the req obj called redirectUrl, storing the originalUrl from the req obj. this is only possible and needed when the user was not authenticated, so in this block..
        // since its now stored in this session, this will now be accessible to all the methods and middlewares.
        // *1 
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    }                   // check /user/login route for the full updated flow..
    next();
};

// *1 : generally it should work but the in the login route, as soon as the user is authenticated by passport, passport wipes out the req.session.redirectUrl informations posing a new problem.
// hence we use locals to store this info, since passport won't have access to delete res.locals. so, a middleware to achieve that
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    } 
    // *2 : whenever the /login route was hit from the home page, i.e, a request coming in with no previous paths, the isLoggedIn middleware is never reached, hence the url variable is not stored/updated, but the route in user.js still uses the same variable to access and route the user. so, do the below else section here, or handle it in that route itself, like its done in this...
    // else {
    //     res.locals.redirectUrl = "/listings";
    // }
    next();
}                             // pass this just before passport authenticates


module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", `You do not have the permission to edit or delete the listing ${listing.title}.`);
        return res.redirect(`/listings/${id}`);
        // let redirectUrl = res.locals.redirectUrl || "/listings";
        // return res.redirect(redirectUrl);
    }
    next();
}

//middleware for validating listing data using Joi schema
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//middleware for validating review data using Joi schema
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}