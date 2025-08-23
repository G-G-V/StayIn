const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

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

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));
 
//Create Route (Post)
app.post("/listings", wrapAsync(async (req, res, next) => {
    // let { title, description, image, price, country, location } = req.body;
    // in the html form's name attributes of the fields, we can send the key-value pair tied to an object in the form object[key] in the name attribute which will be in the body of request as an object, making the accessing/destructuring syntax here easier.
    // let listing = req.body.listing;
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for Listing");      // 400 - Bad Request i.e., client didn't the request correctly
    }                                                           // if the user doesn't use the form, or maybe tester uses directly API's to test and sends an empty body request, then the req.body won't have any object called listing to save. This would be a bad reques, hence throwing a new custom error instead of default.
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    // try{
    // } catch (err) {
    //     next(err);
    // }
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let oldListing = await Listing.findById(id);
    res.render("listings/edit.ejs", { oldListing });
}));

//Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for Listing");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);                  // redirecting to show route instead of index
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
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
    res.status(statusCode).send(message);
    // res.send("Something went wrong!");
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});