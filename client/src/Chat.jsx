import ws from 'ws';
import {useContext, useEffect, useState} from 'react'
import { User } from '../../api/models/User';
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from './UserContext';
import {uniqBy} from "lodash";

export default function Chat() {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const {username, id} = useContext(UserContext);
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]) ;
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
    }, []);
    
    function showOnlinePeople(peopleArray) {
        //create object to show unique people
        const people = {};
        peopleArray.forEach(({userId, username}) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(ev) {
        const messageData = JSON.parse(ev.data);
        console.log({ev, messageData});
        // const messageData = ev.data
        // console.log(messageData);
        // try {
        //     if ("online" in messageData) {
        //         showOnlinePeople(messageData.online);
        //     } else {
        //         console.log(messageData)
        //     }
        // } catch(error) {
        //     console.error("Failed to parse WebSocket message:", error, ev.data);
        // }
        // //console.log(messageData);
        if ("online" in messageData) {
            showOnlinePeople(messageData.online);
        } else if ('text' in messageData) {
            // Add the incoming message to the messages array
            setMessages((prev) => ([...prev, {...messageData}]));
            console.log("Received message:", messageData);
        }
        //setMessages(prev => ([...prev, {text: newMessageText, isOurs: true}]));
    }

    function sendMessage(ev) {
        ev.preventDefault();
        ws.send(JSON.stringify({
                recipient: selectedUserId,
                text: newMessageText,
        }));

        setMessages((prev) => ([...prev, { 
            text: newMessageText, 
            isOurs: true, 
            sender: id,
            recipient: selectedUserId,
            id: Date.now()
            }]))  ;

        setNewMessageText('');
    }

    //delete our own user from the object
    const onlinePeopleExclOurUser = {...onlinePeople};
    delete onlinePeopleExclOurUser[id];

    const messagesWithoutDupes = uniqBy(messages, 'id'); 

    return (
        <div className="flex h-screen">
            <div className="bg-purple-50 w-1/3">
                <Logo />
                {Object.keys(onlinePeopleExclOurUser).map(userId => (
                    <div onClick={() => setSelectedUserId(userId)} 
                    key={userId} 
                    className = {"border-b border-gray-100 flex items-center gap-2 cursor-pointer "+ (userId === selectedUserId ? 'bg-pink-100': '')}>
                        {userId === selectedUserId && (
                            <div className='w-1.5 bg-purple-500 h-12 rounded-r-sm'></div>
                        )}
                        <div className='flex gap-2 py-2 pl-4 items-center'>
                        <Avatar username={onlinePeople[userId]} userId={userId}/>
                        <span className='text-purple-900'>{onlinePeople[userId]}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col bg-gradient-to-r from-pink-100 via-pink-50 to-purple-100 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId && (
                        <div className='flex h-full flex-grow items-center justify-center'>
                            <div className='text-gray-500'>Select a user to start a conversation!</div>
                        </div>
                    )}
                    {!!selectedUserId && (
                        <div className='overflow-scroll-y-scroll'>
                            {messagesWithoutDupes.map(message => (
                                <div className={(message.sender === id ? 'text-right': 'text-left')}>
                                    <div className={"text-left inline-block p-2 my-2 rounded-md text-sm " + (message.sender === id ? 'bg-pink-300 text-white':'bg-white text-gray-500')}>
                                        sender: {message.sender}<br />
                                        my id: {id}<br />
                                        {message.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input type="text" 
                            placeholder="Type your message here!" 
                            className="bg-white flex-grow border p-2 rounded-full"
                            value={newMessageText}
                            onChange={ev => setNewMessageText(ev.target.value)}/>
                        <button className="bg-purple-300 p-2 text-white rounded-full" type="submit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>

                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}