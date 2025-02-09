import React, { useState, useEffect } from 'react'

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
};// Define types for NodeInfo and related objects.


export default function Table({ host }) {
  const [nodes, setNodes] = useState<Map<number, NodeInfo>>(new Map());

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8080/ws");

    ws.onmessage = (event) => {
      try {
        const incomingNode: NodeInfo = JSON.parse(event.data);

        setNodes((prevNodes) => {
          const newNodes = new Map(prevNodes);
          newNodes.set(incomingNode.num, incomingNode);
          return newNodes
        });
      } catch (error) {
        console.error("Error parsing NodeInfo node:", error);
      }
    };

    ws.onerror = (error) => { console.error("Websocket error: ", error) }

    return () => { ws.close(); };

  }, []);

  const nodeList = Array.from(nodes.values());

  return (
    <div>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Num</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>User ID</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Long Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Short Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>SNR</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Last Heard</th>
          </tr>
        </thead>
        <tbody>
          {nodeList.map((node) => (
            <tr key={node.num}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{node.num}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{node.user.id}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{node.user.long_name}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{node.user.short_name}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{node.snr}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {new Date(node.last_heard * 1000).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
