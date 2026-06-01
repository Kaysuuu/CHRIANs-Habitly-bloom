import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons for bundled environments
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Recenter({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView(pos, map.getZoom());
  }, [pos, map]);
  return null;
}

export function JogMap({
  position,
  path,
}: {
  position: [number, number] | null;
  path: [number, number][];
}) {
  const center = position ?? [40.7128, -74.006];
  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom
      className="h-full w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position && <Marker position={position} icon={icon} />}
      {path.length > 1 && <Polyline positions={path} pathOptions={{ color: "#0ea5b7", weight: 5 }} />}
      <Recenter pos={position} />
    </MapContainer>
  );
}

// Haversine distance
export function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function useGeoTracker(active: boolean) {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [path, setPath] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported in this browser.");
      return;
    }
    setError(null);
    setPath([]);
    setDistance(0);

    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        const next: [number, number] = [p.coords.latitude, p.coords.longitude];
        setPos(next);
        setPath((prev) => {
          if (prev.length === 0) return [next];
          const last = prev[prev.length - 1];
          const d = distanceKm(last, next);
          if (d < 0.003) return prev; // skip jitter <3m
          setDistance((dist) => dist + d);
          return [...prev, next];
        });
      },
      (err) => setError(err.message || "Unable to fetch location"),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [active]);

  // Get a one-shot initial position to show the map even when not tracking
  useEffect(() => {
    if (active || pos) return;
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, [active, pos]);

  return { pos, path, distance, error, setPath, setDistance };
}
