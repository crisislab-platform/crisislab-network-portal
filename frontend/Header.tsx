import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header({ loggedIn, setLoggedIn, currUser, setCurrUser, host}) {
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
  const logOut = async (event) => {
    event.preventDefault();

    try {
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
          className={`nav-button ${location.pathname === "/accounts" ? "active" : ""}`}
          onClick={goToAccounts}
          
        >
          {loggedIn ? "Account" : "Login"}
        </a>
      </div>
    </div>
  );
}
