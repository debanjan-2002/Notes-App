const express = require("express");
const router = express.Router({ mergeParams: true });

const { isLoggedIn, validateNote } = require("../middleware");
const catchAsync = require("../utils/catchAsync");

const notes = require("../controllers/notes");

router
    .route("/")
    .get(isLoggedIn, catchAsync(notes.getNotes))
    .post(isLoggedIn, validateNote, catchAsync(notes.postNote));

router.get("/new", isLoggedIn, notes.renderNewNote);

module.exports = router;
