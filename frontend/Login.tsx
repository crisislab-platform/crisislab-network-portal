import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { decodeJwt } from 'jose';
import { decode } from 'jose/dist/types/util/base64url';

export default function Login({setLoggedIn, setCurrUser, host, currUser, setIsAdmin}) {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch("http://" + host + "/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to log in");
            }

            const data = await response.json();

            localStorage.setItem("token", data.token)

            const payload = decodeJwt(data.token)

            setCurrUser(payload.sub || "unknown")
            setIsAdmin(payload.is_admin || false)
            console.log(currUser);

            alert("Login sucessfull!");
            
            setLoggedIn(true)
        } catch (error) {
            console.error("Error during login: ", error);
            setError("Invalid username or password");
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                {error && <p>{ error }</p>}
                <div>
                    <label htmlFor='username'>Username: </label>
                    <input id='username' type='text' value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor='password'>Password: </label>
                    <input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />     
                </div>
                <button type='submit'>Submit</button>
            </form>
        </div>
    );
                
}
