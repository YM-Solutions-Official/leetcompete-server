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
        required: function() {
            return !this.auth0Id; // Password not required for Auth0 users
        }
    },
    auth0Id:{
        type: String,
        unique: true,
        sparse: true // allows null values while maintaining uniqueness
    },
    authProvider:{
        type: String,
        enum: ['local', 'auth0'],
        default: 'local'
    },
    emailVerified:{
        type: Boolean,
        default: false
    },
    photoURL:{
        type: String,
        default: ""
    },
    matches:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match"
    }],
},{timestamps: true})

const User = mongoose.model('User', userSchema);
export default User;