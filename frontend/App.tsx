import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Map from "./Map"
import Table from "./Table"
import Header from "./Header"
import Accounts from "./Accounts"
import ChangePassword from './ChangePassword'
import AddUser from './AddUser'
const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [currUser, setCurrUser] = useState<string>("");
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    setHost(location.host)
  }, []);

  const logout = async (event) => {
    event.preventDefault();
    console.log("logging out");

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
  };

  return (
    <div className='measure-body center-body'>
    <Router>
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} currUser={currUser} setCurrUser={setCurrUser} host={host} logout={logout}/> 
      <Routes>
        <Route path="/table" element={<Table />} />
        <Route path="/map" element={<Map />} />
        <Route path="/accounts" element={<Accounts loggedIn={loggedIn} setLoggedIn={setLoggedIn} setCurrUser={setCurrUser} host={host} currUser={currUser} logout={logout}/>}/>
        <Route path="/setpassword" element={<ChangePassword logout={logout} host={host} currUser={currUser}/>} />
        <Route path="/adduser" element={<AddUser currUser={currUser} host={host}/>} />
      </Routes>
    </Router>
    </div>
  );
};

export default App;