if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const engine = require("ejs-mate");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError");

const userRoutes = require("./routes/user");
const noteRoutes = require("./routes/note");

const app = express();

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/users");

const dbURL = process.env.DB_URL || "mongodb://localhost:27017/notes-app";

mongoose
    .connect(dbURL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("Error connecting to MongoDB: " + err.message));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", engine);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const secret = process.env.SECRET || "thisisnotasecret";

const store = new MongoStore({
    mongoUrl: dbURL,
    crypto: { secret },
    touchAfter: 24 * 60 * 60
});

const sessionConfig = {
    store,
    secret,
    resave: false,
    name: "session-config",
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/", (req, res) => {
    res.render("home");
});

app.use("/", userRoutes);
app.use("/:userId/notes", noteRoutes);

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found!", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Oh no!";
    }
    res.status(statusCode).render("error", { err });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
