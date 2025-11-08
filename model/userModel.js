import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        default: "Hi there! I'm using Dev Dual."
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    photoURL:{
        type: String,
        default: ""
    },
    matches:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match"
    }],
    rating:{
        type: Number,
        default: 100
    },
},{timestamps: true})

const User = mongoose.model('User', userSchema);
export default User;