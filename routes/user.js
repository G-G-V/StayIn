const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { isLoggedIn, saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render(`users/signup.ejs`);
});

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({username, email});
        const registeredUser = await User.register(newUser, password);
        // console.log(registeredUser);
        // now to complete the flow of logging in right after signup, we can use the req.login() function, it stores the user in the req.user object
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "User registered. Welcome to StayIn!");
            res.redirect("/listings");
        })
        //
        // req.flash("success", "User registered. Welcome to StayIn!");
        // res.redirect("/listings");
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/signin.ejs");
});

router.post(
    "/login", 
    saveRedirectUrl,                               // saving jusst before passport takes over for authentication
    passport.authenticate("local", { 
        failureRedirect: "/login", 
        failureFlash: true 
    }),                                                              // (strategy, {options})      // this method automatically invokes req.login()
    wrapAsync(async (req, res) => {
        // try {

        // } catch(err) {
        //     req.flash("error", `${e.message}. Login failed, check your credentials!`);
        //     res.redirect("/login");
        // }
        req.flash("success", "Welcome back to StayIn!");
        // // // res.redirect("/listings");
        // // res.redirect(req.session.redirectUrl);
        // res.redirect(res.locals.redirectUrl);            // check for *1  isLoggedIn middleware for info
        // *2:
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    })
);

router.get("/logout", isLoggedIn, (req, res, next) => {
    req.logout((err) => {                                   // it takes a callback in itself, write what needs to happen immediately next
        if(err) {
            return next(err);
        }
        req.flash("success", "You are logged out!")
        res.redirect("/listings");
    });
});

module.exports = router;
