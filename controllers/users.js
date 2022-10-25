const User = require("../models/users");
const transporter = require("../nodemailer");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
};

module.exports.register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash("success", `Welcome ${req.user.username}!`);
            res.redirect(`/${registeredUser._id}/notes`);
        });
        // Email sending
        try {
            const mailDetails = {
                from: `Notes app <${process.env.AUTH_EMAIL}>`,
                to: email,
                subject: `Welcome to Notes App!`,
                text: "Thank You!",
                html: `
                <h3>Thank You for registering</h3>
                <h3>Dear ${username},</h3>
                <p>I am reaching out to thank you for registering to Notes App </p>
                <p>Enjoy creating and storing notes :)</p>
                <hr>
                <p style="font-weight: bold;">Yours Faithfully</p>
                <p style="font-weight: bold;">Debanjan Poddar (Notes App)</p> 
                `,
                replyTo: process.env.AUTH_EMAIL
            };
            await transporter.sendMail(mailDetails);
        } catch (e) {
            console.log(e.message);
        }
    } catch (e) {
        req.flash("error", e.message);
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
