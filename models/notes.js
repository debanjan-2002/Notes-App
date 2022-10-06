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

noteSchema.pre("save", async function (req, res, next) {
    this.lastModified = new Date().toLocaleString();
    await next();
});

module.exports = mongoose.model("Note", noteSchema);
