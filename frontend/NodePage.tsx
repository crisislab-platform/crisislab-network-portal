import React from "react";
import { useLocation } from "react-router-dom";
import AsciiTreeView from "./TreeView";

export default function NodePage({ nodes, isAdmin }) {
  const location = useLocation();
  const nodenum = location.state.nodenum;
  console.log(nodenum);
  const nodedata = nodes.get(Number(nodenum));
  console.log(nodedata);

  return (
    <div>
      <div className="center margin-below1">
        <AsciiTreeView data={nodedata} />
      </div>
      <hr className="hr-dotted" />
      {isAdmin && (
        <div>
          <h3>Send Commands</h3>

          <a className="list-button">placeholder button</a>
        </div>
      )}
    </div>
  );
}
