const mongoose = require("mongoose")

let userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    role: { type: String, enum: ["user", "driver"], default: "user" },
    password: { type: String, required: true, minlength: 8 },
    pickup:{
        pickupStation: { type: String },
        busNumber: { type: String }
    }
})

userSchema.index({ email: 1, role: 1 }, { unique: true });

let userModel = mongoose.model("user", userSchema)

module.exports = userModel