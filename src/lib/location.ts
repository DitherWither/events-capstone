import { updateLocation } from "~/server/auth";

export function locationFetch() {
  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      updateLocation({ x: longitude, y: latitude });
    },
    (error) => {
      console.error("Error fetching location:", error);
    },
    { enableHighAccuracy: true },
  );
}
