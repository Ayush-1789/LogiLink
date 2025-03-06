import {
  MapContainer,
  TileLayer,
  Tooltip,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Map() {
  const pointA: [number, number] = [51.505, -0.09];
  const pointB: [number, number] = [51.7, -0.2];

  const pointC: [number, number] = [51.44, -0.2];
  const pointD: [number, number] = [51.65, -0.05];

  const segments = [
    { positions: [pointA, pointC], color: "green", label: "Land route" },
    { positions: [pointC, pointD], color: "blue", label: "Sea route" },
    {
      positions: [pointD, pointB],
      color: "green",
      label: "Another land route",
    },
  ];

  return (
    <MapContainer
      center={pointA}
      zoom={12}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={pointA}>
        <Popup>Point A</Popup>
      </Marker>
      <Marker position={pointB}>
        <Popup>Point B</Popup>
      </Marker>
      <Marker position={pointC}>
        <Popup>Intermediary Point 1</Popup>
      </Marker>
      <Marker position={pointD}>
        <Popup>Intermediary Point 2</Popup>
      </Marker>
      {segments.map((segment, index) => (
        <>
          <Polyline
            key={index}
            positions={segment.positions}
            color={segment.color}
          >
            <Tooltip
              position={[
                (segment.positions[0][0] + segment.positions[1][0]) / 2,
                (segment.positions[0][1] + segment.positions[1][1]) / 2,
              ]}
              permanent
              direction="top"
              offset={[0, 0]}
            >
              <span>{segment.label}</span>
            </Tooltip>
          </Polyline>
        </>
      ))}
    </MapContainer>
  );
}
