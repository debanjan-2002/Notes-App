const User = require("../models/users");
const Note = require("../models/notes");

const mongoose = require("mongoose");

module.exports.getNotes = async (req, res) => {
    const { userId } = req.params;
    const { sort } = req.query;

    if (mongoose.Types.ObjectId.isValid(userId)) {
        /*
        const user = await User.findById(userId).populate({
            path: "notes",
            options: { limit: 1 },
            match: { title: { $eq: "Test" } },
            select: "title"
        });
        */
        const user = await User.findById(userId);
        if (sort) {
            if (sort === "new") {
                await user.populate({
                    path: "notes",
                    options: { sort: { lastModified: -1 } }
                });
            } else if (sort === "old") {
                await user.populate({
                    path: "notes",
                    options: { sort: { lastModified: 1 } }
                });
            } else {
                await user.populate("notes");
            }
            return res.render("notes/show", { user, userId });
        }
        await user.populate("notes");
        res.render("notes/show", { user, userId });
    } else {
        req.logout(err => {
            req.flash("error", "Invalid user ID");
            res.redirect("/login");
        });
    }
};

module.exports.postNote = async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const note = new Note(req.body.notes);

    user.notes.push(note);
    await user.save();
    await note.save();
    res.redirect(`/${userId}/notes`);
};

module.exports.renderNewNote = (req, res) => {
    const { userId } = req.params;
    res.render("notes/new", { userId });
};

module.exports.renderEditForm = async (req, res) => {
    const { userId, noteId } = req.params;
    const note = await Note.findById(noteId);
    res.render("notes/edit", { note, userId });
};

module.exports.updateNote = async (req, res) => {
    const { noteId, userId } = req.params;
    const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { ...req.body.notes, lastModified: Date.now() },
        { runValidators: true, new: true }
    );
    res.redirect(`/${userId}/notes`);
};

module.exports.deleteNote = async (req, res) => {
    const { noteId, userId } = req.params;
    await User.findByIdAndUpdate(userId, {
        $pull: { notes: noteId }
    });
    await Note.findByIdAndDelete(noteId);
    req.flash("success", "Note deleted successfully!");
    res.redirect(`/${userId}/notes`);
};
