const express = require("express");
const router = express.Router({ mergeParams: true });

const { isLoggedIn, validateNote, isOwner } = require("../middleware");
const catchAsync = require("../utils/catchAsync");

const notes = require("../controllers/notes");

router
    .route("/")
    .get(isLoggedIn, isOwner, catchAsync(notes.getNotes))
    .post(isLoggedIn, isOwner, validateNote, catchAsync(notes.postNote));

router.get("/new", isLoggedIn, isOwner, notes.renderNewNote);

router.get(
    "/:noteId/edit",
    isLoggedIn,
    isOwner,
    catchAsync(notes.renderEditForm)
);

router
    .route("/:noteId")
    .put(isLoggedIn, isOwner, catchAsync(notes.updateNote))
    .delete(isLoggedIn, isOwner, catchAsync(notes.deleteNote));

module.exports = router;
