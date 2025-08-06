import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { liveInfo, Route } from "./App";
import mapboxgl from "mapbox-gl";
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

interface MapPageProps {
  nodes: Map<number, liveInfo>;
  routes: Map<string, Route>;
}

export default function MapPage({ nodes, routes }: MapPageProps) {
  const nodeList = Array.from(nodes.values());
  const routesList = Array.from(routes.values());
  const navigate = useNavigate();

  const [map, setMap] = useState(null);

  const defaultCenter = { latitude: 51.505, longitude: -0.09 };

  const getPosition = (nodenum) => {
    const node = nodes.get(nodenum);
    if (
      !node ||
      node.position.latitude_i === undefined ||
      node.position.longitude_i === undefined
    ) {
      return null;
    }

    return {
      latitude: node.position.latitude_i * 1e-7,
      longitude: node.position.longitude_i * 1e-7,
    };
  };

  let center = defaultCenter;
  if (nodeList.length > 0) {
    const first = nodeList[0];
    if (
      first.position.latitude_i !== undefined &&
      first.position.longitude_i !== undefined
    ) {
      center = {
        latitude: first.position.latitude_i * 1e-7,
        longitude: first.position.longitude_i * 1e-7,
      };
    }
  }

  const goToNodePage = (num) => {
    navigate("/nodepage", { state: { nodenum: num } });
  };

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [center.longitude, center.latitude],
      zoom: 10,
      accessToken: MAPBOX_TOKEN,
    });

    setMap(mapInstance);

    // Cleanup map on unmount
    return () => mapInstance.remove();
  }, []); // Empty array ensures map is only initialized once

  // Add markers and lines once the map is initialized
  useEffect(() => {
    if (map) {
      nodeList.forEach((node) => {
        const position = getPosition(node.nodenum);
        if (position) {
          const { latitude, longitude } = position;
          const marker = new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map);
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <h3>${node.user.long_name}</h3>
                <p><strong>Last Heard: </strong> ${node.timestamp}</p>
                <button onClick={goToNodePage(${node.nodenum})}>Info</button>
              `);
          marker.setPopup(popup);
        }
      });

      routesList.forEach((route) => {
        const fromPos = getPosition(route.from);
        const toPos = getPosition(route.to);
        if (fromPos && toPos) {
          const { latitude: fromLat, longitude: fromLng } = fromPos;
          const { latitude: toLat, longitude: toLng } = toPos;

          new mapboxgl.Polyline({
            path: [
              [fromLng, fromLat],
              [toLng, toLat],
            ],
            color: "blue",
          }).addTo(map);
        }
      });
    }
  }, [map, nodeList, routesList]); // Only re-run this effect when map or nodes/routes change

  return (
    <div>
      <div id="map" style={{ height: "100vh", width: "100%" }}></div>

      {nodeList.map((node) => {
        const position = getPosition(node.nodenum);
        if (!position) return null;

        return (
          <div key={node.nodenum}>
            <p>{node.user.long_name}</p>
            <button onClick={() => goToNodePage(node.nodenum)}>
              Node Page
            </button>
          </div>
        );
      })}
    </div>
  );
}
