import mongoose from "mongoose";
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

const User = mongoose.model("User", userSchema);
export default User;