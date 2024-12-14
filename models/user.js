import mongoose from "mongoose";
import dotenv from "dotenv";
import passportLocalMongoose from "passport-local-mongoose";
import findOrCreate from "mongoose-findorcreate";

dotenv.config();

const userSchema = new mongoose.Schema({
    email: { 
        type: String,
        unique: true // Keep unique but optional
    },
    password: {
        type: String,
    },
    googleId: { 
        type: String,
        unique: true, 
        required: false
    },
    secret: {
        type: String
    }
});

// Add plugins
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
userSchema.plugin(findOrCreate); // Adds the `findOrCreate` method

const User = mongoose.model("User", userSchema);

export default User;
