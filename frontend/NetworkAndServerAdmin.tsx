import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AsciiTreeView from "./TreeView";
import { setMeshSettings, setServerSettings } from "./App";

interface NetworkAndServerAdminProps {
  host: string;
  isAdmin: boolean;
}

export default function NetworkAndServerAdmin({
  host,
  isAdmin,
}: NetworkAndServerAdminProps) {
  const [broadcastInterval, setBroadcastInterval] = useState<number>(0);
  const [channelName, setChannelName] = useState<string>("");
  const [ping_timeout_seconds, setPing_timeout_seconds] = useState<number>(0);
  const [get_settings_timeout_seconds, setGet_setting_timeout_seconds] =
    useState<number>(0);
  const [signal_data_timeout_seconds, setSignal_data_timeout_seconds] =
    useState<number>(0);
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
        const msg = await response.text();
        console.log("failed to set mesh settings: " + msg);
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
    fetch("http://" + host + "/get-mesh-settings")
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

    fetch("http://" + host + "/get-server-settings")
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
      <div className="left settings-box">
        Mesh Settings
        <form onSubmit={handleMeshSubmit}>
          <div className="settings-div">
            <label className="settings-label">BroadCastInterval: </label>
            <input
              type="number"
              className="settings-input"
              value={broadcastInterval}
              onChange={(e) => setBroadcastInterval(e.target.valueAsNumber)}
            />
          </div>
          <div className="settings-div">
            <label className="settings-label">Channel Name: </label>
            <input
              type="text"
              className="settings-input"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>
          <div className="settings-div">
            <label className="settings-label">Ping timeout (s): </label>
            <input
              type="number"
              className="settings-input"
              value={ping_timeout_seconds}
              onChange={(e) => setPing_timeout_seconds(e.target.valueAsNumber)}
            />
          </div>
          <div className="settings-div">
            <label className="settings-label">Signal Data Timeout (s): </label>
            <input
              type="number"
              className="settings-input"
              value={signal_data_timeout_seconds}
              onChange={(e) => setSignal_data_timeout_seconds(e.target.valueAsNumber)}
            />
          </div>
          <button type="submit" className="settings-submit-button">
            Set Mesh Settings
          </button>
        </form>
      </div>
      {isAdmin && <div className="vr"></div>}
      {isAdmin && (
        <div className="right settings-box">
          Server Settings
          <form onSubmit={handleServerSubmit}>
            <div className="settings-div">
              <label className="settings-label">
                Get setting timeout (s):{" "}
              </label>
              <input
                type="number"
                className="settings-input"
                value={get_settings_timeout_seconds}
                onChange={(e) => setGet_setting_timeout_seconds(e.target.valueAsNumber)}
              />
            </div>
            <div className="settings-div">
              <label className="settings-label">
                Set Signal Data timeout (s):
              </label>
              <input
                type="number"
                className="settings-input"
                value={signal_data_timeout_seconds}
                onChange={(e) => setSignal_data_timeout_seconds(e.target.valueAsNumber)}
              />
            </div>
            <div className="settings-div">
              <label className="settings-label">Route Cost Weight: </label>
              <input
                type="number"
                className="settings-input"
                value={route_cost_weight}
                onChange={(e) => setRoute_cost_weight(e.target.valueAsNumber)}
              />
            </div>
            <div className="settings-div">
              <label className="settings-label">Route Hops Weight: </label>
              <input
                type="number"
                className="settings-input"
                value={route_hops_weight}
                onChange={(e) => setRoute_hops_weight(e.target.valueAsNumber)}
              />
            </div>
            <button type="submit" className="settings-submit-button">
              Update Server Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
