import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import AsciiTreeView from "./TreeView";
import { setMeshSettings, setServerSettings } from "./App";

interface NetworkAndServerAdminProps {
  broadCastInterval: number;
  setBroadCastInterval: React.Dispatch<React.SetStateAction<number>>;
  channelName: string;
  setChannelName: React.Dispatch<React.SetStateAction<string>>;
  ping_timeout_seconds: string;
  setPing_timeout_seconds: React.Dispatch<React.SetStateAction<string>>;
  signal_data_timeout_seconds: string;
  setSignal_data_timeout_seconds: React.Dispatch<React.SetStateAction<string>>;
}

export default function NetworkAndServerAdmin({
  broadCastInterval,
  setBroadCastInterval,
  channelName,
  setChannelName,
  ping_timeout_seconds,
  setPing_timeout_seconds,
  signal_data_timeout_seconds,
  setSignal_data_timeout_seconds,
}: NetworkAndServerAdminProps) {
  return (
    <div>
      <form>
        <div>
          <label>BroadCastInterval</label>
          <input
            type="text"
            value={broadCastInterval}
            onChange={(e) => setBroadCastInterval(e.target.value)}
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
  );
}
