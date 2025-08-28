import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapPage from "./MapPage";
import Table from "./Table";
import Header from "./Header";
import Accounts from "./Accounts";
import ChangePassword from "./ChangePassword";
import AddUser from "./AddUser";
import Search from "./Search";
import NodePage from "./NodePage";
import NetworkAndServerAdmin from "./NetworkAndServerAdmin";
import { icon } from "leaflet";
import { parse } from "path";

export enum HardwareModel {
  UNSET = 0,
  TLORA_V2 = 1,
  TLORA_V1 = 2,
  TLORA_V2_1_1P6 = 3,
  TBEAM = 4,
  HELTEC_V2_0 = 5,
  TBEAM_V0P7 = 6,
  T_ECHO = 7,
  TLORA_V1_1P3 = 8,
  RAK4631 = 9,
  HELTEC_V2_1 = 10,
  HELTEC_V1 = 11,
  LILYGO_TBEAM_S3_CORE = 12,
  RAK11200 = 13,
  NANO_G1 = 14,
  TLORA_V2_1_1P8 = 15,
  TLORA_T3_S3 = 16,
  NANO_G1_EXPLORER = 17,
  NANO_G2_ULTRA = 18,
  LORA_TYPE = 19,
  WIPHONE = 20,
  WIO_WM1110 = 21,
  RAK2560 = 22,
  HELTEC_HRU_3601 = 23,
  HELTEC_WIRELESS_BRIDGE = 24,
  STATION_G1 = 25,
  RAK11310 = 26,
  SENSELORA_RP2040 = 27,
  SENSELORA_S3 = 28,
  CANARYONE = 29,
  RP2040_LORA = 30,
  STATION_G2 = 31,
  LORA_RELAY_V1 = 32,
  NRF52840DK = 33,
  PPR = 34,
  GENIEBLOCKS = 35,
  NRF52_UNKNOWN = 36,
  PORTDUINO = 37,
  ANDROID_SIM = 38,
  DIY_V1 = 39,
  NRF52840_PCA10059 = 40,
  DR_DEV = 41,
  M5STACK = 42,
  HELTEC_V3 = 43,
  HELTEC_WSL_V3 = 44,
  BETAFPV_2400_TX = 45,
  BETAFPV_900_NANO_TX = 46,
  RPI_PICO = 47,
  HELTEC_WIRELESS_TRACKER = 48,
  HELTEC_WIRELESS_PAPER = 49,
  T_DECK = 50,
  T_WATCH_S3 = 51,
  PICOMPUTER_S3 = 52,
  HELTEC_HT62 = 53,
  EBYTE_ESP32_S3 = 54,
  ESP32_S3_PICO = 55,
  CHATTER_2 = 56,
  HELTEC_WIRELESS_PAPER_V1_0 = 57,
  HELTEC_WIRELESS_TRACKER_V1_0 = 58,
  UNPHONE = 59,
  TD_LORAC = 60,
  CDEBYTE_EORA_S3 = 61,
  TWC_MESH_V4 = 62,
  NRF52_PROMICRO_DIY = 63,
  RADIOMASTER_900_BANDIT_NANO = 64,
  HELTEC_CAPSULE_SENSOR_V3 = 65,
  HELTEC_VISION_MASTER_T190 = 66,
  HELTEC_VISION_MASTER_E213 = 67,
  HELTEC_VISION_MASTER_E290 = 68,
  HELTEC_MESH_NODE_T114 = 69,
  SENSECAP_INDICATOR = 70,
  TRACKER_T1000_E = 71,
  RAK3172 = 72,
  WIO_E5 = 73,
  RADIOMASTER_900_BANDIT = 74,
  ME25LS01_4Y10TD = 75,
  RP2040_FEATHER_RFM95 = 76,
  M5STACK_COREBASIC = 77,
  M5STACK_CORE2 = 78,
  RPI_PICO2 = 79,
  M5STACK_CORES3 = 80,
  SEEED_XIAO_S3 = 81,
  MS24SF1 = 82,
  TLORA_C6 = 83,
  PRIVATE_HW = 255,
}

export enum Role {
  CLIENT = 0,
  CLIENT_MUTE = 1,
  ROUTER = 2,
  ROUTER_CLIENT = 3,
  REPEATER = 4,
  TRACKER = 5,
  SENSOR = 6,
  TAK = 7,
  CLIENT_HIDDEN = 8,
  LOST_AND_FOUND = 9,
  TAK_TRACKER = 10,
}

export enum LocSource {
  LOC_UNSET = 0,
  LOC_MANUAL = 1,
  LOC_INTERNAL = 2,
  LOC_EXTERNAL = 3,
}

export enum AltSource {
  ALT_UNSET = 0,
  ALT_MANUAL = 1,
  ALT_INTERNAL = 2,
  ALT_EXTERNAL = 3,
  ALT_BAROMETRIC = 4,
}

export type Route = {
  to: number;
  from: number;
};

export type User = {
  id: string;
  long_name: string;
  short_name: string;
  hw_model: HardwareModel;
  is_licensed: boolean;
  role: Role; // Replace with an enum if desired.
  public_key: string; // Expecting a base64/hex string representation.
};

export type Position = {
  latitude_i?: number;
  longitude_i?: number;
  altitude?: number;
  time: number;
  location_source: LocSource;
  altitude_source: AltSource;
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

export type setMeshSettings = {
  broadcast_interval_seconds: number;
  channel_name: string;
  ping_timeout_seconds: number;
};

export type setServerSettings = {
  get_settings_timeout_seconds: number;
  signal_data_timeout_seconds: number;
  route_cost_weight: number;
  route_hops_weight: number;
};

export type liveInfo = {
  node_num: number;
  timestamp: number;
  user: User;
  position: Position;
  DeviceMetrics: DeviceMetrics;
};

type liveInfoArray = { cache: liveInfo[] };
type liveInfoSingle = { telemetry: liveInfo };
type liveInfoError = { error: string };
type liveInfoPacket = liveInfoArray | liveInfoSingle | liveInfoError;

type RoutePath = number[];
type updateRouteData = {
  [startNodeId: number]: RoutePath[];
};

type routesIn = Record<number, number[]>;

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [currUser, setCurrUser] = useState<string>("");
  // const [host, setHost] = useState<string | null>(null);
  const host = "127.0.0.1:8001";
  const apiHost = "127.0.0.1:3000";
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
      setIsAdmin(false);
      setCurrUser("");
    } catch (error) {
      console.error("Error during login: ", error);
    }
    setLoggedIn(false);
  };

  const [routes, setRoutes] = useState<Map<string, Route>>(new Map());

  const canonicalKey = (route: Route): string => {
    const [a, b] =
      route.from < route.to ? [route.from, route.to] : [route.to, route.from];
    return `${a}-${b}`;
  };

  const updateRoutes = async (event) => {
    event.preventDefault();
    console.log("sending update routes request");
    fetch("http://" + apiHost + "/admin/update-routes")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: routesIn) => {
        setRoutes((prev) => {
          const updated = new Map(prev);
          console.log("routes");
          console.log(data);

          for (const startNodeId in data) {
            console.log(startNodeId)
            const nextHops = data[startNodeId];
            for (const hop of nextHops) {
              const value: Route = { to: hop, from: Number(startNodeId) };
              const key = canonicalKey(value);
              console.log("the key before setting to the routes map");
              console.log(key);
              updated.set(key, value);
            }
          }
          console.log("updated routes before settings");
          console.log(updated);
          return updated;
        });
        console.log("Routes updated");
        console.log(routes);
      })
      .catch((error) => {
        console.error("Error fetching routes:", error);
      });
  };

  const [nodes, setNodes] = useState<Map<number, liveInfo>>(new Map());
  const [pathData, setPathData] = useState<updateRouteData>();

  useEffect(() => {
    console.log("Updated nodes:", nodes);
  }, [nodes]);

  useEffect(() => {
    const ws = new WebSocket("ws://" + apiHost + "/telemetry/socket");
    ws.onmessage = (event) => {
      try {
        console.log(event.data);
        const parsed: liveInfoPacket = JSON.parse(event.data);

        if ("error" in parsed) {
          console.error("An error from the server: ", parsed.error);
          return;
        }

        if ("telemetry" in parsed) {
          const lI = parsed.telemetry;
          setNodes((prev) => {
            const updated = new Map(prev);
            console.log("map node num");
            console.log(lI.node_num);
            updated.set(lI.node_num, lI);
            return updated;
          });
          return;
        }

        if ("cache" in parsed) {
          setNodes((prev) => {
            const updated = new Map(prev);
            parsed.cache.forEach((lI) => {
              console.log(lI.node_num);
              updated.set(lI.node_num, lI);
            });
            return updated;
          });
          return;
        }

        console.warn("Unknown live endpoint message: ");
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
          <Route
            path="/map"
            element={
              <MapPage
                nodes={nodes}
                routes={routes}
                updateRoutes={updateRoutes}
              />
            }
          />
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
          <Route
            path="/nodepage"
            element={<NodePage nodes={nodes} isAdmin={isAdmin} />}
          />
          <Route
            path="/network-settings"
            element={<NetworkAndServerAdmin host={apiHost} isAdmin={isAdmin} />}
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
