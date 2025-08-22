import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { liveInfo, Route } from "./App";
import mapboxgl from "mapbox-gl";
import { truncate } from "fs";
import { type } from "os";
import { map } from "leaflet";
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

interface MapPageProps {
  nodes: Map<number, liveInfo>;
  routes: Map<string, Route>;
  updateRoutes: (event: React.SyntheticEvent) => Promise<void>;
}

export default function MapPage({ nodes, routes, updateRoutes }: MapPageProps) {
  const nodeList = Array.from(nodes.values());
  const routesList = Array.from(routes.values());
  const navigate = useNavigate();
  const [map, setMap] = useState(null);

  const defaultCenter = { latitude: 51.505, longitude: -0.09 };

  const getPosition = (nodenum: number) => {
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

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [center.longitude, center.latitude],
      zoom: 10,
      accessToken: MAPBOX_TOKEN,
    });

    mapInstance.on("load", () => {
      if (!mapInstance.getSource("routes")) {
        mapInstance.addSource("routes", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          lineMetrics: true,
        });
      }

      if (!mapInstance.getLayer("routes-layer")) {
        mapInstance.addLayer({
          id: "routes-layer",
          type: "line",
          source: "routes",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#1d4ed8",
            "line-width": 3,
            "line-opacity": 0.9,
          },
        });
      }
    });

    setMap(mapInstance);

    // Cleanup map on unmount
    return () => {
      mapInstance.remove();
    }
  }, []); // Empty array ensures map is only initialized once

  const buildRoutesGJ = () => {
    const features = routesList
      .map((route) => {
        const fromPos = getPosition(route.from);
        const toPos = getPosition(route.to);
        if (!fromPos || !toPos) return null;

        return {
          type: "Feature" as const,
          properties: {
            id: `${route.from}->${route.to}`,
          },
          geometry: {
            type: "LineString" as const,
            coordinates: [
              [fromPos.longitude, fromPos.latitude],
              [toPos.longitude, toPos.latitude],
            ],
          },
        };
      })
      .filter(Boolean) as any[];

    return { type: "FeatureCollection" as const, features };
  };

  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const src = map.getSource("routes") as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;

    src.setData(buildRoutesGJ());
  }, [routesList, nodeList]);

  // Add markers and lines once the map is initialized
  useEffect(() => {
    if (map) {
      nodeList.forEach((node) => {
        const position = getPosition(node.node_num);
        if (position) {
          const { latitude, longitude } = position;
          const marker = new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map);
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <h3>${node.user.long_name}</h3>
                <p><strong>Last Heard: </strong> ${node.timestamp}</p>
                <button id="node-btn-${node.node_num}">Info</button>
              `);

          popup.on("open", () => {
            const btn = document.getElementById(`node-btn-${node.node_num}`);
            btn?.addEventListener("click", () => {
              navigate("/nodepage", { state: { nodenum: node.node_num } });
            });
          });
          marker.setPopup(popup);
        }
      });

      // routesList.forEach((route) => {
      //   const fromPos = getPosition(route.from);
      //   const toPos = getPosition(route.to);
      //   if (fromPos && toPos) {
      //     const { latitude: fromLat, longitude: fromLng } = fromPos;
      //     const { latitude: toLat, longitude: toLng } = toPos;
      //
      //     new mapboxgl.Polyline({
      //       path: [
      //         [fromLng, fromLat],
      //         [toLng, toLat],
      //       ],
      //       color: "blue",
      //     }).addTo(map);
      //   }
      // });
    }
  }, [map, nodeList]); // Only re-run this effect when map or nodes/routes change

  return (
    <div>
      <a className="list-button vremp5" onClick={updateRoutes}>Update Routes</a>
      <div id="map" style={{ height: "80vh", width: "100%" }}></div>
    </div>
  );
}
