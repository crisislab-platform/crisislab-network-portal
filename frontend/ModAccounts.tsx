import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";

export default function ModAccounts({currUser, host, setLoggedIn, setCurrUser}) {
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

  const logOut = async (event) => {
    event.preventDefault();

    try {
      console.log(currUser);
      const response = await fetch("http://" + host + "/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: currUser,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log out");
      }


      localStorage.removeItem("token");

      alert("Logout sucessfull!");

      setLoggedIn(false);
      setCurrUser("");
    } catch (error) {
      console.error("Error during login: ", error);
    }
    setLoggedIn(false);
    navigate("/");
  };
  return (
    <div>
      <button onClick={logOut}>Logout</button>
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
