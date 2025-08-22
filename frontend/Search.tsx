import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { liveInfo } from "./App";

interface SearchProps {
  nodes: Map<number, liveInfo>;
}

export default function Search({ nodes }: SearchProps) {
  const [num, setNum] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [devShortName, setDevShortName] = useState<string>("");
  const [devLongName, setDevLongName] = useState<string>("");
  const nodeList = Array.from(nodes.values());
  const navigate = useNavigate();
  return (
    <div>
      <h3>There are currently {nodes.size} nodes to search</h3>
      <div className="form-div-h">
        <div className="form-section-div-h">
          <label className="form-label" htmlFor="num">
            Num:{" "}
          </label>
          <input
            className="form-input"
            id="num"
            type="text"
            value={num}
            onChange={(e) => setNum(e.target.value)}
          />
        </div>
        <div className="form-section-div-h">
          <label className="form-label" htmlFor="username">
            Username:{" "}
          </label>
          <input
            className="form-input"
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-section-div-h">
          <label className="form-label" htmlFor="devShortName">
            SName:{" "}
          </label>
          <input
            className="form-input"
            id="devShortName"
            type="text"
            value={devShortName}
            onChange={(e) => setDevShortName(e.target.value)}
          />
        </div>
        <div className="form-section-div-h">
          <label className="form-label" htmlFor="devLongName">
            LName:{" "}
          </label>
          <input
            className="form-input"
            id="devLongName"
            type="text"
            value={devLongName}
            onChange={(e) => setDevLongName(e.target.value)}
          />
        </div>
      </div>

      <div className="table-div">
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Num</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Username
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Long Name
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Short Name
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                {" "}
                Node Info Page{" "}
              </th>
            </tr>
          </thead>
          <tbody>
            {nodeList
              .filter(
                (node) =>
                  num === "" ||
                  node.node_num === Number(num) ||
                  node.user.id == username ||
                  node.user.short_name === devShortName ||
                  node.user.long_name === devLongName,
              )
              .map((node) => (
                <tr key={node.node_num}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {node.node_num}
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
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/nodepage", {
                          state: { nodenum: node.node_num },
                        });
                      }}
                    >
                      Go to Target
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
