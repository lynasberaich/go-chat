import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import {User} from './models/User.js';
//const User = require('./models/User');

axios.defaults.baseURL = process.env.CLIENT_URL;
axios.defaults.withCredentials = true;

dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
const app = express();

// Allow requests from client url
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true // If you're using cookies or authentication
}));
app.use(express.json());
app.use(cookieParser());

app.get("/test", (req,res) => {
    res.json("test ok");
});

app.get('/profile', (req,res) => {
    console.log('Cookies:', req.cookies); // Log cookies
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userdata) => {
            if (err) {
                console.log('Token verification failed:', err);
                return res.status(401).json('Invalid token');
            }
            console.log('Verified user:', userdata);
            const {id, username} = userdata;
            res.json(userdata);
        });
    } else {
        console.log('No token provided');
        res.status(401).json('no token');
    }

});

app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    //find password in the database
    const foundUser = await User.findOne({username});
    if (foundUser) {
        console.log("user password: ", foundUser.password);
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if (passOk) {
            jwt.sign({userId:foundUser._id, username}, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {httpOnly: true, sameSite:'none', secure:true}).status(201).json({
                id: foundUser._id,
                });
            });
        } else {
            res.status(400).json('Invalid credentials');
        }
    }
});





app.post('/register', async (req,res) => {
    const {username, password} = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({
            username:username, 
            password:hashedPassword});
        jwt.sign({userId:createdUser._id, username}, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {httpOnly: true, sameSite:'none', secure:true}).status(201).json({
            id: createdUser._id,
            username,
            });
        });
    } catch(err) {
        if (err) throw err;
        res.status(500);
    }
    
});
app.listen(4000);



//c3I2pAKHUf6ccFFk
//mongodb+srv://gochat:c3I2pAKHUf6ccFFk@cluster0.lebos.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0