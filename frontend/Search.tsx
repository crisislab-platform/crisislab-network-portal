import React from "react";

export default function Search({ nodes }) {
  return (
    <div>
      <h3>There are currently {nodes.size} nodes to search</h3>
    </div>
  );
}
