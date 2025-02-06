import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";

export function useGoogleMaps(setLocation: (location: string) => void) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadGoogleMaps(() => {
      if (!inputRef.current) return;

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          setLocation(place.formatted_address || "");
          setLocationCoords({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        } else {
          setLocationCoords(null);
        }
      });
    });
  }, []);

  return { inputRef, locationCoords };
}

