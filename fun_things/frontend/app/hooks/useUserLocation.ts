import { useState, useEffect } from "react";

interface Location {
  latitude: number | null;
  longitude: number | null;
}

export function useUserLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getLocation = () => {
    console.log("📍 getLocation() called");

    if (!navigator.geolocation) {
      console.log("❌ Geolocation is not supported by this browser.");
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    console.log("⏳ Requesting user location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        console.log("✅ Location retrieved:", newLocation);
        setLocation(newLocation);
        setError(null);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error getting location:", error);
        setError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Please enable it in settings."
            : "Could not retrieve location."
        );
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    console.log("🟢 Location updated:", location);
  }, [location]);

  return { location, getLocation, error, loading };
}
