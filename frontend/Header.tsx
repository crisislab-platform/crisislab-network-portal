import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header({
  loggedIn,
  setLoggedIn,
  currUser,
  setCurrUser,
  host,
  logout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const goToTable = () => {
    navigate("/table");
  };
  const goToMap = () => {
    navigate("/map");
  };
  const goToAccounts = () => {
    navigate("/accounts");
  };
  const goToSearch = () => {
    navigate("/search");
  };
  const logOutToRoot = async (event) => {
    console.log("logout function:", logout);
    console.log("logging out ");
    await logout(event);
    console.log("should be logged out");
    navigate("/map");
  };

  return (
    <div className="header-div">
      <div className="title-format">
        <a onClick={goToMap}>
          <h1>CrisisLab Lora Network Portal</h1>
        </a>
      </div>
      <div className="center">
        <a
          className={`nav-button ${location.pathname === "/table" ? "active" : ""}`}
          onClick={goToTable}
        >
          Table
        </a>
        <a
          className={`nav-button ${location.pathname === "/map" ? "active" : ""}`}
          onClick={goToMap}
        >
          Map
        </a>
        <a
          className={`nav-button ${location.pathname === "/search" ? "active" : ""}`}
          onClick={goToSearch}
        >
          Search
        </a>
        <a
          className={`nav-button ${location.pathname === "/accounts" ? "active" : ""}`}
          onClick={goToAccounts}
        >
          {loggedIn ? "Account" : "Login"}
        </a>
        {loggedIn && (
          <a className="nav-button" onClick={logOutToRoot}>
            Logout
          </a>
        )}
      </div>
      <hr className="hr-solid"></hr>
    </div>
  );
}
