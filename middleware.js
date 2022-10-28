const { noteSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/users");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in!");
        res.redirect("/login");
    } else {
        next();
    }
};

module.exports.isNotLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect(`/${req.user._id}/notes`);
    }
    next();
};

module.exports.validateNote = (req, res, next) => {
    const { error } = noteSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        next(new ExpressError(msg, 400));
    } else {
        next();
    }
};

module.exports.isOwner = (req, res, next) => {
    const { userId } = req.params;

    if (userId != req.user._id) {
        req.flash("error", "You don't have permission to view this page!");
        return res.redirect(`/${req.user._id}/notes`);
    }
    next();
};

module.exports.isUserVerified = async (req, res, next) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username });

        if (!user || user.isVerified) {
            return next();
        }
        req.flash(
            "error",
            "Your account has not been verified yet! Please check your email to verify your account"
        );
        res.redirect("/login");
    } catch (e) {
        req.flash(
            "error",
            "Something went wrong. Please contact us for assistance"
        );
        res.redirect("/login");
    }
};
