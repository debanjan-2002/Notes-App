const express = require("express");
const passport = require("passport");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");

const users = require("../controllers/users");
const { isUserVerified } = require("../middleware");

router
    .route("/login")
    .get(users.renderLogin)
    .post(
        catchAsync(isUserVerified),
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
            keepSessionInfo: true
        }),
        users.login
    );

router
    .route("/register")
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.get("/logout", users.logout);

router.get("/verify-email", catchAsync(users.verify));

module.exports = router;
