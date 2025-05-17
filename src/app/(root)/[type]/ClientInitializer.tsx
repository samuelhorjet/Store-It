"use client";

import { useEffect } from "react";
import { initializeCapacitorPlugins } from "@/app/Capacitor-PLugins";

export default function ClientInitializer() {
  useEffect(() => {
    initializeCapacitorPlugins();
  }, []);

  return null; // no UI, just initialize plugins
}
