const express = require("express");
const router = express.Router({ mergeParams: true });       // mergeParams: true is used to access the params from the parent router, i.e., to access :id from /listings/:id/reviews route in this router.


// middlewares and models and utils required
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const { reviewSchema } = require("../schema.js");           // moved with middleware func
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");


// //middleware for validating review data using Joi schema
// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// }                             // moved to middleware file


//Post Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(async(req, res) => {                 // In the app.js file, we have routed all the /listings/:id/reviews routes to this file, so here it is just / and so on instead of /listings/:id/reviews and similarly for other routes.
    // console.log(req.params.id, req.body);              // testing if we can access the :id param from the parent router (/listings/:id/reviews) and also the body of the request sent from hoppscotch. It works perfectly fine.
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    //
    newReview.author = req.user._id;
    //    just before pushing and saving into the db.
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");

    res.redirect(`/listings/${listing._id}`); 
}));                                                           // In Server-side validation, the hoppscotch body is sent empty and we get the message on screen(html section) as ' "review" is required ', so the body is empty and hence the error. But if we send the body as { "review" : {} }, then we get the message as ' "rating" is required, "comment" is required ' since the review object is present but the keys inside it are missing. So the validation is working perfectly fine. And when urlencoded form is sent from the form through hoppscotch, the req.body has the review object with the keys and values. So, we will have to send like this in hoppscotch to test the review post route: review[rating] : 4 and review[comment] : "Great Place!" in the body section of hoppscotch with x-www-form-urlencoded selected.

//Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });         // $pull operator removes from an existing array all instances of a value or values that match a specified condition. Here we are removing the reviewId from the reviews array in the listing document.
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    
    res.redirect(`/listings/${id}`);
}));


module.exports = router;