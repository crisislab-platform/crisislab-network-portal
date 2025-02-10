// src/MapComponent.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
// We no longer import CSS or images via the bundler since CSS is loaded via CDN,
// and images are referenced from the public folder.

// -------------------------------------------------------------------
// Type Definitions (based on your protobuf definitions)
// -------------------------------------------------------------------

export default function MapPage() {
  // Maintain a map of nodes keyed by node number.
  const position = [51.505, -0.09];

  return (
    <div className="map-wrapper">
      <MapContainer
        center={position}
        zoom={13}
        style={{ width: "20rem", height: "20rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
