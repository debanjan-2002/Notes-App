const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const Note = require("./notes");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    token: String,
    isVerified: Boolean,
    notes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Note"
        }
    ]
});

userSchema.post("findOneAndDelete", async doc => {
    if (doc) {
        await Note.deleteMany({
            _id: { $in: doc.notes }
        });
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
