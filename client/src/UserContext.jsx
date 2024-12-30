import {createContext, useState, useEffect} from 'react';
import axios from "axios";


export const UserContext = createContext({});


export function UserContextProvider({children}) {
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        axios.get('http://localhost:5173/profile', { withCredentials: true })
        .then(response => {
            const { username, userId } = response.data;
            setUsername(username);
            setId(userId);
  
        })
        .catch(err => {
            console.error("Error fetching profile:", err.response?.data || err.message);
        })
        .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Or a spinner
    }

    return (
        <UserContext.Provider value={{username, setUsername, id, setId}}>
            {children}
        </UserContext.Provider>
    )
}