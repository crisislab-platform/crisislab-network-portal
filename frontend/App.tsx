import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Map from "./Map"
import Table from "./Table"
import Header from "./Header"
import Accounts from "./Accounts"
const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  return (
    <div className='measure-body center-body'>
    <Router>
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn}/> 
      <Routes>
        <Route path="/table" element={<Table />} />
        <Route path="/map" element={<Map />} />
        <Route path="/accounts" element={<Accounts loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}/>
      </Routes>
    </Router>
    </div>
  );
};

export default App;