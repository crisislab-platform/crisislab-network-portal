import React, {useState} from 'react'
import { useLocation, useNavigate } from "react-router-dom";

export default function ChangePassword({logout, host, currUser}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, isAdmin} = location.state || {};
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [error, setError] = useState("");      

  
  const handleSubmit = async (event) => {
    event.preventDefault();

   try {
    const response = await fetch("http://" + host + "/resetpassword", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            operator: currUser,
            username,
            oldPassword,
            newPassword,
        }),
    });
  
    if (!response.ok) {
        throw new Error("Failed to reset password");
    }
  
  
    alert("password reset sucessfull!");
    if (isAdmin) {
        navigate("/accounts");
    }else{
        logout(event);
        navigate("/map");
    }
  } catch (error) {
    console.error("Error during password reset: ", error);
    setError("Invalid username or password");
  }
};
  
return (
    <div className='form-div'>
        <form onSubmit={handleSubmit}>
            {error && <p>{ error }</p>}
            {!isAdmin && <div className='form-section-div'>
                <label htmlFor='oldpassword'>Old Password: </label>
                <input id='oldPassword' type='password' value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
            </div>}
            <div className='form-section-div'>
                <label htmlFor='newpassword'>New Password: </label>
                <input id='newPassword' type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <button className='form-submit-button' type='submit'>Submit</button>
        </form>
    </div>
);
}
