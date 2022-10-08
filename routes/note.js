const express = require("express");
const router = express.Router({ mergeParams: true });

const { isLoggedIn, validateNote, isNoteOwner } = require("../middleware");
const catchAsync = require("../utils/catchAsync");

const notes = require("../controllers/notes");

router
    .route("/")
    .get(isLoggedIn, isNoteOwner, catchAsync(notes.getNotes))
    .post(isLoggedIn, validateNote, catchAsync(notes.postNote));

router.get("/new", isLoggedIn, notes.renderNewNote);

router.get(
    "/:noteId/edit",
    isLoggedIn,
    isNoteOwner,
    catchAsync(notes.renderEditForm)
);

router
    .route("/:noteId")
    .put(isLoggedIn, isNoteOwner, catchAsync(notes.updateForm))
    .delete(isLoggedIn, isNoteOwner, catchAsync(notes.deleteNote));

module.exports = router;
