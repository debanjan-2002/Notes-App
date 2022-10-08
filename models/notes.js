const mongoose = require("mongoose");
const { Schema } = mongoose;

const noteSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    lastModified: {
        type: String,
        default: () => {
            return new Date().toLocaleString();
        }
    }
});

module.exports = mongoose.model("Note", noteSchema);
