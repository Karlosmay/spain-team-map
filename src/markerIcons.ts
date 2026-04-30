import L from "leaflet";

const baseIcon = {
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
};

export const markerIcons = {
  MPS: L.icon({
    ...baseIcon,
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
  }),

  Manager: L.icon({
    ...baseIcon,
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
  }),

  PSS: L.icon({
    ...baseIcon,
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
  }),

  default: L.icon({
    ...baseIcon,
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
  })
};
``
