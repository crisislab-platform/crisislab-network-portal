import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Map from "./Map"
import Table from "./Table"
import Header from "./Header"
const App: React.FC = () => {
  return (
    <div className='measure-body center-body'>
    <Router>
      <Header /> 
      <Routes>
        <Route path="/table" element={<Table />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </Router>
    </div>
  );
};

export default App;