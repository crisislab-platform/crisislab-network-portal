import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AsciiTreeView from "./TreeView";
import { setMeshSettings, setServerSettings } from "./App";

interface NetworkAndServerAdminProps {
  host: string;
}

export default function NetworkAndServerAdmin({
  host,
}: NetworkAndServerAdminProps) {
  const [broadcastInterval, setBroadcastInterval] = useState<number>(-1);
  const [channelName, setChannelName] = useState<string>("");
  const [ping_timeout_seconds, setPing_timeout_seconds] = useState<number>(-1);
  const [get_settings_timeout_seconds, setGet_setting_timeout_seconds] =
    useState<number>(-1);
  const [signal_data_timeout_seconds, setSignal_data_timeout_seconds] =
    useState<number>(-1);
  const [route_cost_weight, setRoute_cost_weight] = useState<number>(0);
  const [route_hops_weight, setRoute_hops_weight] = useState<number>(0);

  const handleMeshSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const meshData: setMeshSettings = {
      broadcast_interval_seconds: broadcastInterval,
      channel_name: channelName,
      ping_timeout_seconds: ping_timeout_seconds,
    };

    try {
      const response = await fetch(
        "http://" + host + "/admin/set-mesh-settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(meshData),
        },
      );

      if (!response.ok) {
        console.log("failed to set mesh settings: " + response.text());
        return;
      }
    } catch (err) {
      console.log("error in mesh settings submit: " + err);
    }
  };

  const handleServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const meshData: setServerSettings = {
      get_settings_timeout_seconds: get_settings_timeout_seconds,
      signal_data_timeout_seconds: signal_data_timeout_seconds,
      route_cost_weight: route_cost_weight,
      route_hops_weight: route_cost_weight,
    };

    try {
      const response = await fetch(
        "http://" + host + "/admin/set-server-settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(meshData),
        },
      );

      if (!response.ok) {
        console.log("failed to set server settings: " + response.text());
        return;
      }
    } catch (err) {
      console.log("error in server settings submit: " + err);
    }
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/get-mesh-settings")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: setMeshSettings) => {
        setBroadcastInterval(data.broadcast_interval_seconds);
        setChannelName(data.channel_name);
        setPing_timeout_seconds(data.ping_timeout_seconds);
      })
      .catch((error) => {
        console.error("Error fetching mesh settings");
      });

    fetch("http://127.0.0.1:8000/get-server-settings")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: setServerSettings) => {
        setGet_setting_timeout_seconds(data.get_settings_timeout_seconds);
        setSignal_data_timeout_seconds(data.signal_data_timeout_seconds);
        setRoute_cost_weight(data.route_cost_weight);
        setRoute_hops_weight(data.route_hops_weight);
      })
      .catch((error) => {
        console.error("Error fetching server settings");
      });
  }, []);

  return (
    <div className="settingspage">
      <div className="left">
        <form>
          <div>
            <label>BroadCastInterval</label>
            <input
              type="text"
              value={broadcastInterval}
              onChange={(e) => setBroadcastInterval(e.target.value)}
            />
          </div>
          <div>
            <label>Channel Name</label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>
          <div>
            <label>Ping timeout (s)</label>
            <input
              type="number"
              value={ping_timeout_seconds}
              onChange={(e) => setPing_timeout_seconds(e.target.value)}
            />
          </div>
          <div>
            <label>Signal Data Timeout (s)</label>
            <input
              type="text"
              value={signal_data_timeout_seconds}
              onChange={(e) => setSignal_data_timeout_seconds(e.target.value)}
            />
          </div>
        </form>
      </div>
      {isAdmin && <div className="vr"></div>}
      {isAdmin && (
        <div className="right">
          <form>
            <div>
              <label>get setting timeout (s)</label>
              <input
                type="text"
                value={get_settings_timeout_seconds}
                onChange={(e) => setGet_setting_timeout_seconds(e.target.value)}
              />
            </div>
            <div>
              <label>Set Signal Data timeout (s)</label>
              <input
                type="text"
                value={signal_data_timeout_seconds}
                onChange={(e) => setSignal_data_timeout_seconds(e.target.value)}
              />
            </div>
            <div>
              <label>Route Cost Weight</label>
              <input
                type="number"
                value={route_cost_weight}
                onChange={(e) => setRoute_cost_weight(e.target.value)}
              />
            </div>
            <div>
              <label>Route Hops Weight</label>
              <input
                type="text"
                value={route_hops_weight}
                onChange={(e) => setRoute_hops_weight(e.target.value)}
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
