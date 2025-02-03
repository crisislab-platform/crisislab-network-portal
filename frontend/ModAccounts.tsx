import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";

export default function ModAccounts({currUser, host, setLoggedIn, setCurrUser, logout, isAdmin}) {
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleRemove = async (user) => {
        try {
            const response = await fetch("http://" + host + "/remove_user", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    remover: currUser,
                    username: user,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to remove user");
            }
            navigate("/accounts")
        } catch (error) {
            console.error("Error during user removal: ", error);
            setError("You don't have permissions to delete the person");
        }
    }

  

  

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
  
  const goToAddUser = () => {
    navigate("/adduser");
  }


  return (
    <div>
      <div className='center margin-below1'>
        {isAdmin && <a className='nav-button' onClick={goToAddUser}>Add a new user</a>} 
        <a className='nav-button' onClick={() => handlePasswordChange(currUser)}>Reset Password</a>
      </div>
      <hr className='hr-dotted' />
      {error && <p>Error: {error}</p>}
      {isAdmin && <div>
        <h3>All users</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id} className='nav-button'>Username: {user.username}, Is an Admin?: {user.is_admin ? "YES" : "NO"}&nbsp;&nbsp;&nbsp;&nbsp;<a className='list-button' onClick={() => handlePasswordChange(user.username)}>Reset {user.username}'s Password</a>&nbsp;&nbsp;&nbsp;&nbsp;<a className='list-button' onClick={() => handleRemove(user.username)}>Remove {user.username}</a></li>
          ))}
        </ul>
      </div> 
      }
    </div>
  )
}
