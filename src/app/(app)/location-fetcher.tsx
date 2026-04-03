"use client";
import { useEffect } from "react";
import { locationFetch } from "~/lib/location";

export function LocationFetcher({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    locationFetch();
  }, []);

  return children;
}
