const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");                                    // these commented lines are not required here as the routes have been moved to separate files for better code management and modularity.

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");


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


//here middleware for validating listings and review data using Joi schema and the listings and review routes were written which are now moved to routes/listing.js file and routes/review.js file respectively for better code management and modularity.
// app.use("/listings", listingRoutes);      // previous way of routing the listing routes
// app.use("/listings/:id/reviews", reviewRoutes);   // previous way of routing the review routes

app.use("/listings", listings);

app.use("/listings/:id/reviews", reviews);


app.all("*some", (req, res, next) => {                                 // 404 Route - should be at the end after all other routes
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