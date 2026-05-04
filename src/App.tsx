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
  region: string;
};

/* CLUSTER ICON */
const createClusterCustomIcon = (cluster: any) =>
  L.divIcon({
    html: `
      <div class="cluster-marker">
        <span class="cluster-count">${cluster.getChildCount()}</span>
      </div>
    `,
    className: "custom-cluster-icon",
    iconSize: L.point(40, 40, true)
  });

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* Load CSV */
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

  /* ROLE OPTIONS */
  const roleStats = useMemo(() => {
    const roles = new Set<string>();
    people.forEach(p => {
      if (p.roleGroup?.trim()) roles.add(p.roleGroup.trim());
    });
    return ["All", ...Array.from(roles).sort()];
  }, [people]);

  /* FILTERED PEOPLE */
  const filteredPeople = useMemo(() => {
    return people
      .filter(p => typeof p.lat === "number" && typeof p.lng === "number")
      .filter(p => selectedRole === "All" || p.roleGroup === selectedRole)
      .filter(p => selectedRegion === "All" || p.region === selectedRegion);
  }, [people, selectedRole, selectedRegion]);

  const visibleList = filteredPeople.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>

      {/* LEFT PANEL */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 10,
          zIndex: 1000,
          width: "240px",
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "6px" }}>
          Team members
        </div>

        <input
          type="text"
          placeholder="Search name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "6px",
            marginBottom: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <div
          onClick={() => setSelectedPerson(null)}
          style={{
            cursor: "pointer",
            fontWeight: selectedPerson === null ? "bold" : "normal",
            marginBottom: "6px"
          }}
        >
          All members
        </div>

        {visibleList.map(person => (
          <div
            key={person.name}
            onClick={() => setSelectedPerson(person.name)}
            style={{
              cursor: "pointer",
              padding: "4px 0",
              fontWeight: selectedPerson === person.name ? "bold" : "normal",
              color: selectedPerson === person.name ? "#2a93d5" : "#333"
            }}
          >
            {person.name}
          </div>
        ))}
      </div>

      {/* ROLE FILTER */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
        {roleStats.map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            style={{
              marginRight: "6px",
              padding: "4px 8px",
              fontWeight: selectedRole === role ? "bold" : "normal"
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {/* REGION FILTER */}
      <div style={{ position: "absolute", top: 60, right: 10, zIndex: 1000 }}>
        {["All", "Coast", "Pistacho"].map(region => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            style={{
              marginRight: "6px",
              padding: "4px 8px",
              fontWeight: selectedRegion === region ? "bold" : "normal"
            }}
          >
            {region}
          </button>
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

        <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
          {filteredPeople
            .filter(p => selectedPerson === null || p.name === selectedPerson)
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
                    {person.image && (
                      <img
                        src={person.image}
                        alt={person.name}
                        style={{
                          width: "90px",
                          height: "90px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginBottom: "6px"
                        }}
                      />
                    )}

                    <div style={{ fontWeight: 600 }}>{person.name}</div>
                    <div style={{ fontSize: "0.85rem" }}>{person.role}</div>
                    <div style={{ fontSize: "0.75rem" }}>{person.city}</div>
                    <div style={{ fontSize: "0.75rem" }}>
                      Region: {person.region}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* CLUSTER STYLES */}
      <style>{`
        .custom-cluster-icon { background: none; border: none; }
        .cluster-marker {
          width: 40px;
          height: 40px;
          background: #2a93d5;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .cluster-count {
          color: white;
          font-weight: bold;
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
