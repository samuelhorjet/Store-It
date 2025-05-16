import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.storeit.app",
  appName: "StoreIt",
  server: {
    url: "https://store-iit.netlify.app", // your live Netlify app URL
    cleartext: false, // ensures it uses HTTPS
  },
};

export default config;
