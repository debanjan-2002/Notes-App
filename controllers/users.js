const User = require("../models/users");
const transporter = require("../nodemailer");
const { v4: uuid4 } = require("uuid");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
};

module.exports.register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({
            email,
            username,
            token: uuid4(),
            isVerified: false
        });
        await User.register(user, password);

        const mailDetails = {
            from: `Notes app <${process.env.AUTH_EMAIL}>`,
            to: email,
            subject: `Welcome to Notes App!`,
            text: `
                Thank you for registering on Notes App.
                Dear ${username},
                I am reaching out to thank you for registering to Notes App.
                Please copy and paste the address below to verify your account.
                http://${req.headers.host}/verify-email?token=${user.token}
                Enjoy creating and storing notes :)
                Debanjan Poddar
                Notes App
            `,
            html: `
                <h3>Thank You for registering on Notes App.</h3>
                <h3>Dear ${username},</h3>
                <p>I am reaching out to thank you for registering to Notes App.</p>
                <p>Please click the link below to verify your account.</p>
                <a href="http://${req.headers.host}/verify-email?token=${user.token}">Verify your account</a>
                <p>Enjoy creating and storing notes :)</p>
                <hr>
                <p style="font-weight: bold;">Debanjan Poddar</p> 
                <p style="font-weight: bold;">Notes App</p>
            `,
            replyTo: process.env.AUTH_EMAIL
        };

        try {
            await transporter.sendMail(mailDetails);
            req.flash(
                "success",
                "Thank you for registering! Please check your email to verify your account"
            );
            res.redirect("/register");
        } catch (e) {
            console.log(e.message);
            await User.findOneAndDelete({ username });

            req.flash(
                "error",
                "Something went wrong. Please contact us for assistance"
            );
            res.redirect("/register");
        }
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
};

module.exports.verify = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ token });
        if (!user) {
            req.flash(
                "error",
                "Token is invalid! Please contact us for assistance"
            );
            return res.redirect("/register");
        }
        user.token = null;
        user.isVerified = true;
        await user.save();
        await req.login(user, err => {
            if (err) {
                return next(err);
            }
            req.flash(
                "success",
                `Account verified successfully! Welcome ${req.user.username}!`
            );
            res.redirect(`/${user._id}/notes`);
        });
    } catch (e) {
        req.flash(
            "error",
            "Something went wrong. Please contact us for assistance"
        );
        res.redirect("/register");
    }
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    req.flash("success", `Welcome back ${req.user.username}!`);
    const { _id } = req.user;
    res.redirect(`/${_id}/notes`);
};

module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Good bye!");
        res.redirect("/");
    });
};

module.exports.renderChangePassword = (req, res) => {
    const { userId } = req.params;
    res.render("users/forget", { userId });
};

module.exports.changePassword = async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(userId);
        await user.changePassword(oldPassword, newPassword);
        req.flash("success", "Password changed successfully!");
        res.redirect(`/${userId}/notes`);
    } catch (e) {
        req.flash("error", "Old password is incorrect!");
        res.redirect(`/${userId}/change-password`);
    }
};
