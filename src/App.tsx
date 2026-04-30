import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import { markerIcons } from "./markerIcons";

export default function App() {
  const [people, setPeople] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("All");

  // Load CSV once on startup
  useEffect(() => {
    async function loadPeopleFromCSV() {
      const response = await fetch("/people.csv");
      const csvText = await response.text();

      const result = Papa.parse(csvText, {
        header: true,
        delimiter: ";",
        dynamicTyping: true,
        skipEmptyLines: true
      });

      setPeople(result.data as any[]);
    }

    loadPeopleFromCSV();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* FILTER CONTROLS */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: "white",
          padding: "8px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
        }}
      >
{["All", "MPS", "Manager", "Support"].map(role => (
  <button
    key={role}
    onClick={() => setSelectedRole(role)}
    style={{
      marginRight: "6px",
      padding: "4px 8px",
      cursor: "pointer",
      fontWeight: selectedRole === role ? "bold" : "normal"
    }}
  >
    {role}
  </button>
))}
          >
            {role}
          </button>
        ))}
      </div>

      {/* LEGEND */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 10,
          zIndex: 1000,
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          fontSize: "0.85rem"
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
          Legend
        </div>
       <div>🔵 MPS</div>
<div>🔴 Manager</div>
<div>🟢 Support</div>
      </div>

      {/* MAP */}
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={6}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {people
          .filter(
            person =>
              selectedRole === "All" ||
              person.roleGroup === selectedRole
          )
          .map((person, index) => (
            <Marker
              key={index}
              position={[person.lat, person.lng]}
              icon={markerIcons[person.roleGroup] ?? markerIcons.default}
            >
              <Popup>
                <div
                  style={{
                    width: "180px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center"
                  }}
                >
                  <img
                    src={person.image}
                    alt={person.name}
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "10px"
                    }}
                  />

                  <div style={{ fontWeight: 600 }}>
                    {person.name}
                  </div>

                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#555",
                      marginTop: "2px"
                    }}
                  >
                    {person.role}
                  </div>

                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#777",
                      marginTop: "4px"
                    }}
                  >
                    {person.city}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
