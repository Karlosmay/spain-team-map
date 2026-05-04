import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
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

/* ✅ CUSTOM CLUSTER ICON (pin-style with visible number) */
const createClusterCustomIcon = (cluster: any) => {
  return L.divIcon({
    html: `
      <div class="cluster-marker">
        <span class="cluster-count">
          ${cluster.getChildCount()}
        </span>
      </div>
    `,
    className: "custom-cluster-icon",
    iconSize: L.point(40, 40, true)
  });
};

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedRole, setSelectedRole] = useState("All");

  /* Load CSV once */
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

  /* ✅ AUTO-GENERATE ROLES + COUNTERS */
  const roleStats = useMemo(() => {
    const counts: Record<string, number> = {};

    people.forEach(person => {
      const role = person.roleGroup?.trim();
      if (!role) return;
      counts[role] = (counts[role] ?? 0) + 1;
    });

    const roles = Object.keys(counts).sort();

    return {
      roles: ["All", ...roles],
      counts,
      total: people.length
    };
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
        {roleStats.roles.map(role => (
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
          fontSize: "0.85rem",
          minWidth: "150px"
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
          Legend
        </div>

        {Object.entries(roleStats.counts).map(([role, count]) => (
          <div key={role}>
            {role === "MPS" && "🔵 "}
            {role === "Manager" && "🔴 "}
            {role === "PSS" && "🟢 "}
            {role} ({count})
          </div>
        ))}

        <div
          style={{
            marginTop: "8px",
            paddingTop: "6px",
            borderTop: "1px solid #ddd",
            fontWeight: 600
          }}
        >
          Total: {roleStats.total}
        </div>
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

        <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
          {people
            .filter(
              p =>
                typeof p.lat === "number" &&
                typeof p.lng === "number"
            )
            .filter(
              p =>
                selectedRole === "All" ||
                p.roleGroup?.trim() === selectedRole
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
        </MarkerClusterGroup>
      </MapContainer>

      {/* ✅ CLUSTER ICON STYLES */}
      <style>{`
        .custom-cluster-icon {
          background: none;
          border: none;
        }

        .cluster-marker {
          width: 40px;
          height: 40px;
          background: #2a93d5;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 5px rgba(0,0,0,0.4);
          position: relative;
        }

        .cluster-count {
          color: white;
          font-weight: bold;
          font-size: 14px;
          transform: rotate(45deg);
          z-index: 2;
        }

        .cluster-marker::after {
          content: "";
          width: 28px;
          height: 28px;
          background: #2a93d5;
          border-radius: 50%;
          position: absolute;
          transform: rotate(45deg);
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
