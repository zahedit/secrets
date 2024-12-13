import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true 
    },
    password: {
        type: String,
        required: true 
    }
});

const secret = process.env.SECRET_KEY
userSchema.plugin(encrypt, { 
    secret: secret, 
    encryptedFields: ["password"] // Corrected option name
});

const User = mongoose.model("User", userSchema);
export default User;