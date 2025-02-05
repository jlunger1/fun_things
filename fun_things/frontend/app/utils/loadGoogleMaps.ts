// utils/loadGoogleMaps.ts
declare global {
  interface Window {
    google: any;
  }
}

export const loadGoogleMaps = (callback: () => void) => {
  if (window.google && window.google.maps && window.google.maps.places) {
    callback();
    return;
  }

  if (document.querySelector("#google-maps")) {
    return; // Script is already added
  }

  const script = document.createElement("script");
  script.id = "google-maps"; // Unique ID to prevent duplication
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
  script.async = true;
  script.onload = callback;
  document.body.appendChild(script);
};

