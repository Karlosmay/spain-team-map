import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import L from "leaflet";
import { markerIcons } from "./markerIcons";

/* =========================
   Types
========================= */
type Person = {
  name: string;
  role: string;
  roleGroup: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  image: string;
};

type Account = {
  accountName: string;
  accountLead: string;
  robNumber: string;
  region: string;
  city: string;
  lat: number;
  lng: number;
  accountLink: string;
};

/* =========================
   Cluster icon (People)
========================= */
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

/* =========================
   Account icon (NO cluster)
========================= */
const accountIcon = new L.Icon({
  iconUrl: "/icons/account.svg", // or .png
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export default function App() {
  /* =========================
     State
  ========================= */
  const [people, setPeople] = useState<Person[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");

  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAccounts, setShowAccounts] = useState(false);

  /* =========================
     Load People CSV
  ========================= */
  useEffect(() => {
    async function loadPeopleFromCSV() {
      const response = await fetch(`${import.meta.env.BASE_URL}people.csv`);
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

  /* =========================
     Load Accounts CSV
  ========================= */
  useEffect(() => {
    async function loadAccountsFromCSV() {
      const response = await fetch(`${import.meta.env.BASE_URL}accounts.csv`);
      const csvText = await response.text();

      const result = Papa.parse<Account>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });

      setAccounts(result.data);
    }

    loadAccountsFromCSV();
  }, []);

  /* =========================
     Role options (People)
  ========================= */
  const roleOptions = useMemo(() => {
    const roles = new Set<string>();
    people.forEach(p => {
      if (p.roleGroup?.trim()) {
        roles.add(p.roleGroup.trim());
      }
    });
    return ["All", ...Array.from(roles).sort()];
  }, [people]);

  /* =========================
     Filtered People
  ========================= */
  const filteredPeople = useMemo(() => {
    return people
      .filter(p => typeof p.lat === "number" && typeof p.lng === "number")
      .filter(p => selectedRole === "All" || p.roleGroup === selectedRole)
      .filter(p => selectedRegion === "All" || p.region === selectedRegion);
  }, [people, selectedRole, selectedRegion]);

  /* =========================
     Filtered Accounts
  ========================= */
  const filteredAccounts = useMemo(() => {
    return accounts
      .filter(a => typeof a.lat === "number" && typeof a.lng === "number")
      .filter(a => selectedRegion === "All" || a.region === selectedRegion);
  }, [accounts, selectedRegion]);

  /* =========================
     Role counters (People)
  ========================= */
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredPeople.forEach(p => {
      if (!p.roleGroup) return;
      counts[p.roleGroup] = (counts[p.roleGroup] ?? 0) + 1;
    });
    return counts;
  }, [filteredPeople]);

  const visiblePeopleList = filteredPeople.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* =========================
     UI
  ========================= */
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
        {/* PEOPLE LIST */}
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

        {visiblePeopleList.map(person => (
          <div
            key={person.name}
            onClick={() => setSelectedPerson(person.name)}
            style={{
              cursor: "pointer",
              padding: "4px 0",
              fontWeight:
                selectedPerson === person.name ? "bold" : "normal"
            }}
          >
            {person.name}
          </div>
        ))}

        {/* ACCOUNTS LIST */}
        {showAccounts && (
          <>
            <div
              style={{
                fontWeight: 600,
                marginTop: "12px",
                marginBottom: "6px"
              }}
            >
              Accounts
            </div>

            <div
              onClick={() => setSelectedAccount(null)}
              style={{
                cursor: "pointer",
                fontWeight:
                  selectedAccount === null ? "bold" : "normal",
                marginBottom: "6px"
              }}
            >
              All accounts
            </div>

            {filteredAccounts.map(account => (
              <div
                key={account.accountName}
                onClick={() =>
                  setSelectedAccount(account.accountName)
                }
                style={{
                  cursor: "pointer",
                  padding: "4px 0",
                  fontWeight:
                    selectedAccount === account.accountName
                      ? "bold"
                      : "normal"
                }}
              >
                {account.accountName}
              </div>
            ))}
          </>
        )}
      </div>

      {/* ROLE FILTER */}
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
        {roleOptions.map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            style={{ marginRight: "6px" }}
          >
            {role}
            {role !== "All" && roleCounts[role] !== undefined && (
              <> ({roleCounts[role]})</>
            )}
          </button>
        ))}
      </div>

      {/* REGION FILTER + LAYER TOGGLE */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 10,
          zIndex: 1000,
          background: "white",
          padding: "8px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
        }}
      >
        {["All", "Coast", "Pistacho"].map(region => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            style={{ marginRight: "6px" }}
          >
            {region}
          </button>
        ))}

        <div style={{ marginTop: "6px" }}>
          <label>
            <input
              type="checkbox"
              checked={showAccounts}
              onChange={() => setShowAccounts(v => !v)}
            />{" "}
            Accounts
          </label>
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

        {/* PEOPLE LAYER (CLUSTERED) */}
        <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
          {filteredPeople
            .filter(
              p => selectedPerson === null || p.name === selectedPerson
            )
            .map((person, index) => (
              <Marker
                key={index}
                position={[person.lat, person.lng]}
                icon={
                  markerIcons[person.roleGroup] ??
                  markerIcons.default
                }
              >
                <Popup>
                  <div style={{ textAlign: "center" }}>
                    {person.image && (
                      <img
                        src={person.image}
                        alt={person.name}
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          marginBottom: "8px"
                        }}
                      />
                    )}
                    <div style={{ fontWeight: 600 }}>
                      {person.name}
                    </div>
                    <div>{person.role}</div>
                    <div>{person.city}</div>
                    <div>Region: {person.region}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>

        {/* ACCOUNTS LAYER (NO CLUSTER) */}
        {showAccounts &&
          filteredAccounts
            .filter(
              a =>
                selectedAccount === null ||
                a.accountName === selectedAccount
            )
            .map((account, index) => (
              <Marker
                key={`account-${index}`}
                position={[account.lat, account.lng]}
                icon={accountIcon}
              >
                <Popup>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 600 }}>
                      {account.accountName}
                    </div>
                    <div>Lead: {account.accountLead}</div>
                    <div>ROB: {account.robNumber}</div>
                    <div>
                      {account.city} — {account.region}
                    </div>
                    <a
                      href={account.accountLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open account details
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
      </MapContainer>
    </div>
  );
}