import React from "react";
import { useLocation } from "react-router-dom";
import AsciiTreeView from "./TreeView";
import { liveInfo } from "./App";

interface NodePageProps {
  nodes: Map<number, liveInfo>;
  isAdmin: boolean;
}

export default function NodePage({ nodes, isAdmin }: NodePageProps) {
  const location = useLocation();
  const nn = location.state?.nodenum;
  console.log("nodepage nodeum");
  console.log(nn);
  console.log(Array.from(nodes.keys()));
  const nodedata = nodes.get(nn);
  console.log(nodedata);

  return (
    <div className="nodepage">
      <div className="left">
        <p>NodeInfo</p>
        <AsciiTreeView data={nodedata} />
      </div>
      {isAdmin && <div className="vr"></div>}
      {isAdmin && (
        <div className="right">
          <div>
            <h3>Send Commands</h3>{" "}
            <a className="list-button">placeholder button</a>
          </div>
        </div>
      )}
    </div>
  );
}
