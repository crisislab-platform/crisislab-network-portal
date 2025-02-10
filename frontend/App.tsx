import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapPage from "./MapPage";
import Table from "./Table";
import Header from "./Header";
import Accounts from "./Accounts";
import ChangePassword from "./ChangePassword";
import AddUser from "./AddUser";
import Search from "./Search";

// Define types for NodeInfo and related objects.
type NodeInfo = {
  num: number;
  user: User;
  position: Position;
  snr: number;
  last_heard: number;
  device_metrics: DeviceMetrics;
  channel: number;
  via_mqtt: boolean;
  hops_away?: number;
  is_favorite: boolean;
};

type User = {
  id: string;
  long_name: string;
  short_name: string;
  hw_model: number; // You could replace this with an enum if needed.
  is_licensed: boolean;
  role: number; // Replace with an enum if desired.
  public_key: string; // Expecting a base64/hex string representation.
};

type Position = {
  latitude_i?: number;
  longitude_i?: number;
  altitude: number;
  time: number;
  location_source: number;
  altitude_source: number;
  timestamp: number;
  timestamp_millis_adjust: number;
  altitude_hae?: number;
  altitude_geoidal_separation?: number;
  PDOP: number;
  HDOP: number;
  VDOP: number;
  gps_accuracy: number;
  ground_speed?: number;
  ground_track?: number;
  fix_quality: number;
  fix_type: number;
  sats_in_view: number;
  sensor_id: number;
  next_update: number;
  seq_number: number;
  precision_bits: number;
};

type DeviceMetrics = {
  battery_level?: number;
  voltage?: number;
  channel_utilization?: number;
  air_util_tx?: number;
  uptime_seconds?: number;
};

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [currUser, setCurrUser] = useState<string>("");
  // const [host, setHost] = useState<string | null>(null);
  const host = "127.0.0.1:8001";
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  // useEffect(() => {
  //   setHost(location.host)
  // }, []);

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

  const [nodes, setNodes] = useState<Map<number, NodeInfo>>(new Map());

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8080/ws");
    ws.onmessage = (event) => {
      try {
        const incomingNode: NodeInfo = JSON.parse(event.data);
        setNodes((prevNodes) => {
          const newNodes = new Map(prevNodes);
          newNodes.set(incomingNode.num, incomingNode);
          return newNodes;
        });
      } catch (error) {
        console.error("Error parsing NodeInfo node:", error);
      }
    };
    ws.onerror = (error) => {
      console.error("Websocket error: ", error);
    };
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="measure-body center-body">
      <Router>
        <Header
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          currUser={currUser}
          setCurrUser={setCurrUser}
          host={host}
          logout={logout}
        />
        <Routes>
          <Route path="/table" element={<Table nodes={nodes} />} />
          <Route path="/map" element={<MapPage />} />
          <Route
            path="/accounts"
            element={
              <Accounts
                loggedIn={loggedIn}
                setLoggedIn={setLoggedIn}
                setCurrUser={setCurrUser}
                host={host}
                currUser={currUser}
                logout={logout}
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
              />
            }
          />
          <Route
            path="/setpassword"
            element={
              <ChangePassword logout={logout} host={host} currUser={currUser} />
            }
          />
          <Route
            path="/adduser"
            element={<AddUser currUser={currUser} host={host} />}
          />
          <Route path="/search" element={<Search nodes={nodes} />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
