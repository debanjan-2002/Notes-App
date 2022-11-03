const User = require("../models/users");
const Note = require("../models/notes");

module.exports.getNotes = async (req, res) => {
    const { username } = req.params;
    const { sort } = req.query;

    // const user = await User.findByUsername(username).populate({
    //     path: "notes",
    //     options: { limit: 1 },
    //     match: { title: { $eq: "Test" } },
    //     select: "title"
    // });

    const user = await User.findByUsername(username);
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
        return res.render("notes/show", { user });
    }
    await user.populate("notes");
    res.render("notes/show", { user });
};

module.exports.postNote = async (req, res) => {
    const { username } = req.params;
    const user = await User.findByUsername(username);
    const note = new Note(req.body.notes);

    user.notes.push(note);
    await user.save();
    await note.save();
    res.redirect(`/${username}/notes`);
};

module.exports.renderNewNote = (req, res) => {
    const { username } = req.params;
    res.render("notes/new", { username });
};

module.exports.renderEditForm = async (req, res) => {
    const { username, noteId } = req.params;
    const note = await Note.findById(noteId);
    res.render("notes/edit", { note, username });
};

module.exports.updateNote = async (req, res) => {
    const { noteId, username } = req.params;
    await Note.findByIdAndUpdate(
        noteId,
        { ...req.body.notes, lastModified: Date.now() },
        { runValidators: true, new: true }
    );
    res.redirect(`/${username}/notes`);
};

module.exports.deleteNote = async (req, res) => {
    const { noteId, username } = req.params;

    await User.findOneAndUpdate({ username }, { $pull: { notes: noteId } });
    await Note.findByIdAndDelete(noteId);

    req.flash("success", "Note deleted successfully!");
    res.redirect(`/${username}/notes`);
};
