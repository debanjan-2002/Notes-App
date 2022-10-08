const { noteSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in!");
        res.redirect("/login");
    } else {
        next();
    }
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

module.exports.isNoteOwner = (req, res, next) => {
    const { userId } = req.params;

    if (userId != req.user._id) {
        req.flash("error", "You don't have permission!");
        return res.redirect(`/${req.user._id}/notes`);
    }
    next();
};
