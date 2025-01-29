import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";

export default function ModAccounts({currUser, host, setLoggedIn, setCurrUser, logout}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://" + host + "/users");
        if (!response.ok) {throw new Error("Failed to fetch users");}
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err); 
        setError(err.message);
      }
    };
    fetchUsers();
  }, [host])

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("http://" + host + "/admincheck/" + currUser);
        if (!response.ok) {
          throw new Error("failed to check admin status: ");
        }
        const data = await response.json();
        setIsAdmin(data.is_admin);
      } catch (err) {
        console.error("Error checking the admin status of the user:", err );
        setError(err.message);
      }
    };
    checkAdmin();
  }, [host, currUser]);

  

  const handlePasswordChange = (passChanger) => {
    navigate("/setpassword", {
      state: {
        username: passChanger,
        isAdmin: isAdmin,
      }
    });
  };

 const logOutToRoot = async (event) => {
    console.log("logout function:", logout);
    console.log("logging out ");
    await logout(event);
    console.log("should be logged out");
    navigate("/map");
  }


  return (
    <div>
      <button onClick={logOutToRoot}>Logout</button>

      <div>
        <h3>Reset your password</h3>
        <a className='nav-button' onClick={() => handlePasswordChange(currUser)}>Reset Password</a>
      </div>
      {error && <p>Error: {error}</p>}
      {isAdmin && <div className='all-users-div'>
        <h3>All users</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id} className='users-li'>Username: {user.username}, Is an Admin?: {user.is_admin ? "YES" : "NO"}</li>
          ))}
        </ul>
      </div> 
      }
    </div>
  )
}
