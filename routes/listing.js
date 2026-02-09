const express = require("express");
const router = express.Router();


const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const { listingSchema } = require("../schema.js");             // moved with middleware
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


// //middleware for validating listing data using Joi schema
// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// }                       // moved to dedicated middleware.js file and imported


//Index Route
router.get("/", wrapAsync(async (req, res) => {               // replaced app with router, so app.get -> router.get
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {                            // now here the routes can just be / , /new etc. instead of '/listings', '/listings/new', or '/listings/:id', as in app.js we have routed all /listings routes to this file, so here it is just / or /new adn so on.
    // console.log(req.user);                           // can check the user details, before and after authenticated.
    // if(!req.isAuthenticated()) {
    //     req.flash("error", "You must be logged in to create a listing!");
    //     return res.redirect("/login");
    // }                                       // transferred to middleware.js, to reuse in other routes
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews").populate("owner");                                      // previously(before reviews) : let listing = await Listing.findById(id);            // also chain the owner field to be populated
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    // console.log(listing);
    // // alt:  throwing an error and directing to the error page with a status code
    // if (!listing) {
    //     throw new ExpressError(404, "Listing does not exist!");
    // }
    // // alt 1: 
    // if (!listing) {
    //     req.flash("error", "Listing does not exist");
    //     return next(new ExpressError(404, "Listing does not exist"));
    // }
    res.render("listings/show.ejs", { listing });
}));
 
//Create Route (Post)
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    // // let { title, description, image, price, country, location } = req.body;
    // // in the html form's name attributes of the fields, we can send the key-value pair tied to an object in the form object[key] in the name attribute which will be in the body of request as an object, making the accessing/destructuring syntax here easier.
    // // let listing = req.body.listing;
    // if (!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for Listing");      // 400 - Bad Request i.e., client didn't the request correctly
    // }                                                           // if the user doesn't use the form, or maybe tester uses directly API's to test and sends an empty body request, then the req.body won't have any object called listing to save. This would be a bad reques, hence throwing a new custom error instead of default.
    // const newListing = new Listing(req.body.listing);
    // await newListing.save();
    // res.redirect("/listings");
    // // try{...
    // // } catch (err) {
    // //     next(err);
    // // }


    // //       after using Joi for server-side validation of schema:
    // let result = listingSchema.validate(req.body);              // sending into listingSchema whether to check if the req.body is being successfully validated by the Joi schema we have setup
    // //console.log(result);
    // if (result.error) {                                     // since the joi returns an error and value key, we can access error if it exists for clean error messages.
    //     throw new ExpressError(400, result.error);
    // }
    //     now converting the above joi related code into a middleware by converting it into a function
    const newListing = new Listing(req.body.listing);
    //
    newListing.owner = req.user._id;
    //
    await newListing.save();
    req.flash("success", "New Listing Created!");                // before redirecting,... success local variable is then used in index page of listings
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let oldListing = await Listing.findById(id);
    if (!oldListing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { oldListing });
}));

//Update Route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    // if (!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for Listing");
    // }
    let { id } = req.params;
    // // Authorization : Already the Edit and Delete buttons are hidden for unauthourized accounts, but here, making the routes secure from server side from being able to access by api's.
    // let listing = await Listing.findById(id);
    // if (!listing.owner._id.equals(res.locals.currUser._id)) {
    //     req.flash("error", `You do not have the permission to edit the listing ${listing.title}.`);
    //     return res.redirect(`/listings/${id}`);
    // }
    // // now this authorization logic is moved to a middleware for better code management and reusability, and isOwner middleware is created in middleware.js file for that, which is then used here and in the delete route as well.
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);                  // redirecting to show route instead of index
}));

//Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));


module.exports = router;



// app.get("/testListing", (req, res) => {
//     let sampleListing = new Listing({
//         title: "New Villa",
//         description: "By the Beach",
//         price: 1200,
//         location: "Panambur, Mangaluru",
//         country: "India",
//     });

//     // sampleListing.save().then((res) => {
//     //     console.log("saved");
//     // }).catch(err => {
//     //     console.log(err);
//     // });
//     res.send("successful testing")
// });