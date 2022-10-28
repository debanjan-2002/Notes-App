const express = require("express");
const passport = require("passport");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");

const users = require("../controllers/users");
const {
    isUserVerified,
    isLoggedIn,
    isOwner,
    isNotLoggedIn
} = require("../middleware");

router
    .route("/login")
    .get(isNotLoggedIn, users.renderLogin)
    .post(
        isNotLoggedIn,
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
    .get(isNotLoggedIn, users.renderRegister)
    .post(isNotLoggedIn, catchAsync(users.register));

router.route("/logout").get(users.logout);

router.route("/verify-email").get(catchAsync(users.verifyAccount));

router
    .route("/:userId/change-password")
    .get(isUserVerified, isLoggedIn, isOwner, users.renderChangePassword)
    .post(
        isUserVerified,
        isLoggedIn,
        isOwner,
        catchAsync(users.changePassword)
    );

router
    .route("/:userId")
    .delete(
        isUserVerified,
        isLoggedIn,
        isOwner,
        catchAsync(users.deleteAccount)
    );

router
    .route("/forget-password")
    .get(isNotLoggedIn, users.renderForgetPassword)
    .post(isNotLoggedIn, catchAsync(users.forgetPassword));

router
    .route("/update-password")
    .get(isNotLoggedIn, catchAsync(users.renderUpdatePassword))
    .post(isNotLoggedIn, catchAsync(users.updatePassword));

module.exports = router;
