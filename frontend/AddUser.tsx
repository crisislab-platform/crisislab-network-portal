import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

export default function AddUser({ currUser, host }) {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [admin, setAdmin] = useState<boolean>(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            let tok = localStorage.getItem("token");
            const response = await fetch("http://" + host + "/add_user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: tok,
                    username,
                    password,
                    isAdmin: admin,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to log in");
            }
            
            navigate("/accounts");
            
        } catch (error) {
            console.error("Error during login: ", error);
            setError("Invalid username or password");
        }
    };

    return (
        <div className='form-div'>
            <form onSubmit={handleSubmit}>
                {error && <p>{ error }</p>}
                <div className='form-section-div'>
                    <label className='form-label' htmlFor='username'>Username: </label>
                    <input className='form-input' id='username' type='text' value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className='form-section-div'>
                    <label className='form-label' htmlFor='password'>Password: </label>
                    <input className='form-input' id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />     
                </div>
                <div className='form-section-div'>
                    <label className='form-label' htmlFor='admin'>Is Admin: </label>
                    <input className='form-input' id='admin' type='checkbox' checked={admin} onChange={(e) => setAdmin(e.target.checked)} />
                </div>
                <button className='form-submit-button' type='submit'>Submit</button>
            </form>
        </div>
    );
}
