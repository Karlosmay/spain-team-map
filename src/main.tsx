import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
.custom-cluster-icon {
  background: none;
  border: none;
}

.cluster-marker {
  width: 40px;
  height: 40px;
  background: #2a93d5; /* neutral marker blue */
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 0 5px rgba(0,0,0,0.4);
}

.cluster-marker::after {
  content: "";
  width: 28px;
  height: 28px;
  background: #2a93d5;
  border-radius: 50%;
  position: absolute;
  transform: rotate(45deg);
}
