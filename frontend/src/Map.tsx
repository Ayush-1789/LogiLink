import React from "react";
import {
  MapContainer,
  TileLayer,
  Tooltip,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Route, Segment } from "./api";
import polyline from "@mapbox/polyline";
import { capitalize } from "./stringUtils";

type MapProps = {
  route: Route;
};

export default function Map(props: MapProps) {
  const { route } = props;
  const { segments } = route.data;

  // Function to set the bounds of the map
  const SetMapBounds = ({ segments }: { segments: Segment[] }) => {
    const map = useMap();
    const bounds: [number, number][] = [];

    segments.forEach((segment) => {
      // If geometry is not null, decode it; otherwise, use the coordinates
      const coordinates = segment.geometry
        ? polyline.decode(segment.geometry)
        : segment.coordinates;

      coordinates.forEach((coord: [number, number]) => {
        bounds.push(coord);
      });
    });

    // Set the bounds to the map
    if (bounds.length > 0) {
      map.fitBounds(bounds);
    }

    return null; // This component does not render anything
  };

  return (
    <MapContainer
      center={[51.505, -0.09]} // You can set this to a more appropriate center based on your data
      zoom={12}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <SetMapBounds segments={segments} />
      {segments.map((segment, index) => {
        // Decode the geometry to get the coordinates
        const coordinates = segment.geometry
          ? polyline.decode(segment.geometry)
          : segment.coordinates;

        return (
          <React.Fragment key={index}>
            <Polyline
              positions={coordinates}
              color={
                segment.mode === "air"
                  ? "#3182ce"
                  : segment.mode === "sea"
                    ? "#319795"
                    : "#38a169"
              }
            >
              <Tooltip
                position={[
                  (coordinates[0][0] + coordinates[coordinates.length - 1][0]) /
                    2,
                  (coordinates[0][1] + coordinates[coordinates.length - 1][1]) /
                    2,
                ]}
                permanent
                direction="top"
                offset={[0, 0]}
              >
                <span>{capitalize(segment.mode)}</span>
              </Tooltip>
            </Polyline>
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}
