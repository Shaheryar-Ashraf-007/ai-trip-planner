import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const MapView = ({ location }) => {
  const position = location || [31.5204, 74.3587]; // default Lahore

  return (
    <MapContainer
      center={position}
      zoom={12}
      style={{ height: "400px", width: "100%", borderRadius: "20px" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Popup>Selected Destination</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;