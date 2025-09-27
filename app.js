const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const listings = require("./routes/listing.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/stayin";

main()
    .then(() => {
        console.log("connectd to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
// app.use(express.static(path.join(__dirname, "public/js")));      // can't use this separate path method of using middlewares, and instead the path specifically is routed in the boilerplate code in the href attribute of the link tag. This is because the main page (index route) was being served with the css file but this middleware failed to do the same when we try going to other route/links which were also written making use of boilerplate (the code of the template was working but the css wasn't being served in the previous method). It is solved if we just set up normally, the public folder here.


app.engine("ejs", ejsMate);

app.get("/", (req, res) => {
    res.send("This is root.");
});


//here middleware for validating review data using Joi schema and the listings routes were written which are now moved to routes/listing.js file.

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}


app.use("/listings", listings);


//Reviews
//Post Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`); 
}));                                                           // In Server-side validation, the hoppscotch body is sent empty and we get the message on screen(html section) as ' "review" is required ', so the body is empty and hence the error. But if we send the body as { "review" : {} }, then we get the message as ' "rating" is required, "comment" is required ' since the review object is present but the keys inside it are missing. So the validation is working perfectly fine. And when urlencoded form is sent from the form through hoppscotch, the req.body has the review object with the keys and values. So, we will have to send like this in hoppscotch to test the review post route: review[rating] : 4 and review[comment] : "Great Place!" in the body section of hoppscotch with x-www-form-urlencoded selected.

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });         // $pull operator removes from an existing array all instances of a value or values that match a specified condition. Here we are removing the reviewId from the reviews array in the listing document.
    await Review.findByIdAndDelete(reviewId);
    
    res.redirect(`/listings/${id}`);
}));


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

app.all("*some", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.send("Something went wrong!");
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});