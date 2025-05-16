import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Toast } from "@capacitor/toast";
import { Device } from "@capacitor/device";

export function initializeCapacitorPlugins() {
  if (Capacitor.isNativePlatform()) {
    App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        requestAllPermissions();
      }
    });

    requestAllPermissions();
  }
}

export async function requestAllPermissions() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Toast.show({
      text: "Requesting permissions...",
    });

    if (Capacitor.getPlatform() === "android") {
      const info = await Device.getInfo();

      if (
        info.operatingSystem === "android" &&
        parseInt(info.osVersion || "0") >= 11 &&
        window.cordova?.plugins?.diagnostic
      ) {
        window.cordova.plugins.diagnostic.requestExternalStorageAuthorization(
          (status: any) => {
            console.log("Storage auth status:", status);
          },
          (error: any) => {
            console.error("Storage auth error:", error);
          }
        );
      }
    }

    await Toast.show({
      text: "Thank you for granting permissions!",
    });
  } catch (error) {
    console.error("Permission request failed:", error);
    await Toast.show({
      text: "Some permissions were not granted.",
    });
  }
}
