import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Toast } from "@capacitor/toast";

// Open file with a native app (Cordova plugin)
export async function openFileWithNativeApp(
  fileUri: string,
  mimeType: string
): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      // For web, just open in a new tab
      window.open(fileUri, "_blank");
      return true;
    }

    // Ensure Cordova plugin is available
    if (
      typeof window !== "undefined" &&
      typeof window.cordova !== "undefined" &&
      typeof window.cordova.plugins !== "undefined" &&
      typeof window.cordova.plugins.fileOpener2 !== "undefined"
    ) {
      return new Promise((resolve) => {
        window.cordova!.plugins!.fileOpener2!.open(fileUri, mimeType, {
          error: (e: any) => {
            console.error("Error opening file:", e);
            Toast.show({ text: "Could not open file with a native app." });
            resolve(false);
          },
          success: () => {
            resolve(true);
          },
        });
      });
    } else {
      await Toast.show({ text: "File opener not available on this device." });
      return false;
    }
  } catch (error) {
    console.error("Error in openFileWithNativeApp:", error);
    await Toast.show({ text: "Error opening file." });
    return false;
  }
}

// Save file and open it with native app
export async function saveAndOpenFile(
  blob: Blob,
  fileName: string,
  mimeType: string
): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    }

    // Convert blob to base64
    const base64Data = await blobToBase64(blob);

    // Use ExternalStorage directory (Android)
    const directory = Directory.ExternalStorage;

    // Get the path for the file
    const path = getPathByMimeType(mimeType, fileName);

    // Save the file
    await Filesystem.writeFile({
      path,
      data: base64Data.split(",")[1], // Remove data URL prefix
      directory,
      recursive: true,
    });

    // Get the file URI
    const fileUri = await Filesystem.getUri({ path, directory });

    await Toast.show({ text: "File saved successfully!" });

    // Open the file
    return await openFileWithNativeApp(fileUri.uri, mimeType);
  } catch (error) {
    console.error("Error in saveAndOpenFile:", error);
    await Toast.show({ text: "Error saving or opening file." });
    return false;
  }
}

// Helper to determine subfolder path by mime type
function getPathByMimeType(mimeType: string, fileName: string): string {
  if (mimeType.startsWith("image/")) return `StoreIt/Images/${fileName}`;
  if (mimeType.startsWith("video/")) return `StoreIt/Videos/${fileName}`;
  if (mimeType.startsWith("audio/")) return `StoreIt/Audio/${fileName}`;
  return `StoreIt/Documents/${fileName}`;
}

// Helper to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
