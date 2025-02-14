// src/MapComponent.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
// We no longer import CSS or images via the bundler since CSS is loaded via CDN,
// and images are referenced from the public folder.

// -------------------------------------------------------------------
// Type Definitions (based on your protobuf definitions)
// -------------------------------------------------------------------

export default function MapPage({ nodes }) {
  const nodeList = Array.from(nodes.values());

  // Maintain a map of nodes keyed by node number.
  const defaultCenter: [number, number] = [51.505, -0.09];
  let center: [number, number] = defaultCenter;
  if (nodeList.length > 0) {
    const first = nodeList[0];
    if (
      first.position.latitude_i !== undefined &&
      first.position.longitude_i !== undefined
    ) {
      center = [
        first.position.latitude_i * 1e-7,
        first.position.longitude_i * 1e-7,
      ];
    }
  }

  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={13} style={{ height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {nodeList.map((node) => {
          if (
            node.position.latitude_i === undefined ||
            node.position.longitude_i === undefined
          ) {
            return null;
          }

          const lat = node.position.latitude_i * 1e-7;
          const lng = node.position.longitude_i * 1e-7;
          return (
            <Marker key={node.num} position={[lat, lng]}>
              <Popup>
                <div>
                  <p>
                    <strong>Name: </strong> {node.user.id}
                  </p>
                  <p>
                    <strong>Long Name: </strong> {node.user.long_name}
                  </p>
                  <p>
                    <strong>Last Heard: </strong>{" "}
                    {new Date(node.last_heard * 1000).toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
