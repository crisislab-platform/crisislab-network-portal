import React, { useState, useEffect } from "react";
import { liveInfo } from "./App";

export default function Table(nodes: Map<number, liveInfo>) {
  const nodeList = Array.from(nodes.values());

  return (
    <div className="table-div">
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Num</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              User ID
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Long Name
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Short Name
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>SNR</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Last Heard
            </th>
          </tr>
        </thead>
        <tbody>
          {nodeList.map((node) => (
            <tr key={node.num}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {node.num}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {node.user.id}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {node.user.long_name}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {node.user.short_name}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {node.snr}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {new Date(node.last_heard * 1000).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
