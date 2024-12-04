import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {User} from './models/User.js';
//const User = require('./models/User');



dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
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
    const {token} = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userdata) => {
            if (err) throw err;
            const {id, username} = userdata;
            res.json(userdata);
        });
    } else {
        res.status(401).json('no token');
    }

});



app.post('/register', async (req,res) => {
    const {username, password} = req.body;
    try {
        const createdUser = await User.create({username, password});
        jwt.sign({userId:createdUser._id}, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).status(201).json({
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