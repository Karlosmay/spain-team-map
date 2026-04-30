import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import { markerIcons } from "./markerIcons";

type Person = {
  name: string;
  role: string;
  roleGroup: string;
  city: string;
  lat: number;
  lng: number;
  image: string;
};

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedRole, setSelectedRole] = useState("All");

  // Load CSV once on startup
  useEffect(() => {
    async function loadPeopleFromCSV() {
      const response = await fetch("/people.csv");
      const csvText = await response.text();

      const result = Papa.parse<Person>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });

      setPeople(result.data);
    }

    loadPeopleFromCSV();
  }, []);

  // ✅ AUTO-GENERATE ROLES FROM CSV
  const roleGroups = useMemo(() => {
    const roles = people
      .map(person => person.roleGroup?.trim())
      .filter(Boolean); // remove undefined / empty

    const uniqueRoles = Array.from(new Set(roles)).sort();

    return ["All", ...uniqueRoles];
  }, [people]);

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
        {roleGroups.map(role => (
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

        {roleGroups
          .filter(role => role !== "All")
          .map(role => (
            <div key={role}>
              {role === "MPS" && "🔵 "}
              {role === "Manager" && "🔴 "}
              {role === "PSS" && "🟢 "}
              {role}
            </div>
          ))}
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
          // ✅ Defensive guard: prevent white-screen on bad data
          .filter(
            person =>
              typeof person.lat === "number" &&
              typeof person.lng === "number"
          )
          .filter(
            person =>
              selectedRole === "All" ||
              person.roleGroup?.trim() === selectedRole
          )
          .map((person, index) => {
            const roleKey = person.roleGroup?.trim();

            return (
              <Marker
                key={index}
                position={[person.lat, person.lng]}
                icon={markerIcons[roleKey] ?? markerIcons.default}
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
                    {person.image}

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
            );
          })}
      </MapContainer>
    </div>
  );
}
