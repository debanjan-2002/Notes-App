const User = require("../models/users");
const Note = require("../models/notes");

const mongoose = require("mongoose");

module.exports.getNotes = async (req, res) => {
    const { userId } = req.params;
    if (mongoose.Types.ObjectId.isValid(userId)) {
        /* 
        const user = await User.findById(userId).populate({
            path: "notes",
            options: { limit: 1 }
        }); 
        */
        const user = await User.findById(userId).populate("notes");
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
        { ...req.body.notes, lastModified: new Date().toLocaleString() },
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
