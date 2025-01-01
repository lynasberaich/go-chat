import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import {WebSocketServer} from 'ws';
import {User} from './models/User.js';
//const User = require('./models/User');

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
            } else {
                const { id, username } = userData;
                connection.userId = id;
                connection.username = username;

                // Re-log all usernames after assigning this connection's username
                console.log('Current WebSocket clients:', 
                    [...wss.clients].map(c => c.username).filter(Boolean)
                );
            }
        });
    } else {
        console.log('No token provided');
        //res.status(401).json('no token');
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


const server = app.listen(4000);


const wss = new WebSocketServer({server});
wss.on('connection', (connection, req) => {

    //get username and id from the cookie to form connection
    const cookies = req.headers.cookie;
    if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.trim().startsWith('token='));
        //console.log(tokenCookieString);
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err) {
                        console.error('JWT verification failed:', err);
                    } else {
                        const {userId, username} = userData;
                        connection.userId = userId;
                        connection.username = username;
                        console.log('New WebSocket connection:', username);
                    }
                });
            } else {
                console.error('Token cookie string not found:', cookies);
            }
        } else {
            console.error('No cookies found in the request headers');
        }
    }


    connection.on('message', (message) => {
        const messageData = JSON.parse(message.toString());
        const {recipient, text} = messageData;
        if (recipient && text) {
            [...wss.clients]
                .filter(c => c.userId === recipient) 
                .forEach(c => c.send(JSON.stringify({text})))
        }

    });

    //notify all about online people when someone connects
    [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online : [...wss.clients].map(c => ({userId: c.userId, username:c.username}))
        }));
    });
});