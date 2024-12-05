import {createContext, useState, useEffect} from 'react';
import axios from "axios";


export const UserContext = createContext({});


export function UserContextProvider({children}) {
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    useEffect(() => {
        axios.get('/profile', { withCredentials: true })
        .then(response => {
            setUsername(response.data.username);
            setId(response.data.userId);
  
        })
        .catch(err => {
            console.error("Error fetching profile:", err.response?.data || err.message);
        });
    }, []);
    return (
        <UserContext.Provider value={{username, setUsername, id, setId}}>
            {children}
        </UserContext.Provider>
    )
}