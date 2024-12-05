import {useState, useContext} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";

export default function RegisterAndLoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('register')
    const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);

    async function handleSubmit(ev) {
        ev.preventDefault();
        const url = isLoginOrRegister === 'register' ? 'http://localhost:4000/register' : 'http://localhost:4000/login'
        const {data} = await axios.post(url, 
                            {username, password},
                            { headers: { 'Content-Type': 'application/json' } } // Include this for JSON
                        );
        setLoggedInUsername(username);
        setId(data.id);
    }  
    return (
        <div className="bg bg-gradient-to-r from-pink-200 to-purple-200 
                        h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input value={username} 
                        onChange={ev => setUsername(ev.target.value)}
                        type="text" placeholder="username" 
                        className="block w-full rounded-sm p-2 mb-2 border" />

                <input value={password}
                        onChange={ev => setPassword(ev.target.value)}
                            type="password" placeholder="password" 
                            className="block w-full rounded-sm p-2 mb-2 border" />
                <button className = "bg-gradient-to-r from-pink-300 to-purple-300 text-white block w-full rounded-sm p-1.5 border-white border-2">
                    {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
                </button> 
                {isLoginOrRegister === 'register' && (
                    <div className="text-center mt-12">
                        <p className="text-xs text-purple-950">Already a member?</p> 
                        <button type="button" onClick={() => setIsLoginOrRegister('login')} 
                        className="text-xs text-purple-950">
                            Login here!
                        </button>
                    </div> 
                )}
                {isLoginOrRegister === 'login' && (
                    <div className="text-center mt-12">
                        <p className="text-xs text-purple-950">Not a member?</p> 
                        <button type="button" onClick={() => setIsLoginOrRegister('register')} 
                        className="text-xs text-purple-950">
                            Register here!
                        </button>
                    </div> 
                )}
                          
            </form>
        </div>
    );
}


//bg-pink-100