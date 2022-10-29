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
                We are reaching out to thank you for registering to Notes App.
                Please copy and paste the address below to verify your account. (Link expires in 10 minutes)
                https://${req.headers.host}/verify-email?token=${user.token}
                Enjoy creating and storing notes :)
                Debanjan Poddar
                Notes App
            `,
            html: `
                <h3>Thank You for registering on Notes App.</h3>
                <h3>Dear ${username},</h3>
                <p>We are reaching out to thank you for registering to Notes App.</p>
                <p>Please click the link below to verify your account. (Link expires in 10 minutes)</p>
                <a href="https://${req.headers.host}/verify-email?token=${user.token}">Verify your account</a>
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
            res.redirect("/login");
        } catch (e) {
            console.log(e.message);
            await User.findOneAndDelete({ username });

            req.flash(
                "error",
                "Something went wrong. Please try registering again or contact us for assistance"
            );
            res.redirect("/register");
        }
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
};

module.exports.verifyAccount = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ token });
        if (!user) {
            req.flash(
                "error",
                "Link has expired! Please register again or contact us for assistance"
            );
            return res.redirect("/register");
        }
        user.token = null;
        user.isVerified = true;
        await user.save();
        req.login(user, err => {
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
    res.render("users/reset", { userId });
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

module.exports.deleteAccount = async (req, res) => {
    const { userId } = req.params;
    try {
        await User.findByIdAndDelete(userId);
        req.flash("success", "Account deleted successfully");
        res.redirect("/login");
    } catch (e) {
        req.flash(
            "error",
            "Something went wrong. Please contact us for assistance"
        );
        res.redirect(`/${userId}/notes`);
    }
};

module.exports.renderForgetPassword = (req, res) => {
    res.render("users/forget");
};

module.exports.forgetPassword = async (req, res) => {
    const { registeredEmail } = req.body;
    try {
        const user = await User.findOne({ email: registeredEmail });
        if (!user) {
            req.flash("error", "No account found with this email");
            return res.redirect("/forget-password");
        }

        user.token = uuid4();
        await user.save();

        const mailDetails = {
            from: `Notes app <${process.env.AUTH_EMAIL}>`,
            to: registeredEmail,
            subject: `Reset Password - Notes App`,
            text: `
                Dear ${user.username},
                We have received a request to reset the password of your account in Notes App.
                Please copy and paste the address below to reset your password.
                https://${req.headers.host}/update-password?token=${user.token}
                Debanjan Poddar
                Notes App
            `,
            html: `
                <h3>Dear ${user.username},</h3>
                <p>We have received a request to reset the password of your account in Notes App.</p>
                <p>Please click the link below to reset your password.</p>
                <a href="https://${req.headers.host}/update-password?token=${user.token}">Reset Password</a>
                <hr>
                <p style="font-weight: bold;">Debanjan Poddar</p> 
                <p style="font-weight: bold;">Notes App</p>
            `,
            replyTo: process.env.AUTH_EMAIL
        };
        try {
            await transporter.sendMail(mailDetails);
            req.flash("success", "Check your email to reset your password");
            res.redirect("/login");
        } catch (e) {
            console.log(e.message);
            user.token = null;
            await user.save();

            req.flash(
                "error",
                "Something went wrong. Please try again or contact us for assistance"
            );
            res.redirect("/forget-password");
        }
    } catch (e) {
        req.flash(
            "error",
            "Something went wrong. Please contact us for assistance"
        );
        res.redirect("/forget-password");
    }
};

module.exports.renderUpdatePassword = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ token });
        if (!user) {
            req.flash(
                "error",
                "Token is invalid/expired! Please contact us for assistance"
            );
            return res.redirect("/login");
        }
        res.render("users/update", { user });
    } catch (e) {
        req.flash(
            "error",
            "Something went wrong. Please contact us for assistance"
        );
        res.redirect("/forget-password");
    }
};

module.exports.updatePassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        await user.setPassword(newPassword);
        user.token = null;
        await user.save();

        req.login(user, err => {
            if (err) {
                return next(err);
            }
            req.flash(
                "success",
                `Password reset successful! Welcome ${req.user.username}!`
            );
            res.redirect(`/${user._id}/notes`);
        });
    } catch (e) {
        req.flash(
            "error",
            "Something went wrong. Please contact us for assistance"
        );
        res.redirect("/forget-password");
    }
};
