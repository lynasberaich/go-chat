import mongoose from 'mongoose';


const UserSchema  = new mongoose.Schema({
    username: {type:String, unique:true},
    password: String,
}, {timestamp: true});


export const User = mongoose.model('User', UserSchema);