import { useState, useEffect } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

interface UseUserLocationReturn {
  location: Location | null;
  getLocation: () => void;
  error: string | null;
  refreshLocation: () => void;
}

export const useUserLocation = (): UseUserLocationReturn => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          localStorage.setItem('userLocation', JSON.stringify(newLocation));
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  useEffect(() => {
    // Try to get cached location first
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      setLocation(JSON.parse(cachedLocation));
      return;
    }

    // If no cached location, fetch new location
    getLocation();
  }, []); // Empty dependency array means this runs once on mount

  // Optional: Add a function to manually refresh location if needed
  const refreshLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          localStorage.setItem('userLocation', JSON.stringify(newLocation));
        },
        (error) => {
          setError(error.message);
        }
      );
    }
  };

  return { location, error, getLocation, refreshLocation };
};
