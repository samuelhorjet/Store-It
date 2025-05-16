// Add this to your existing globals.d.ts or create a new index.d.ts file


interface Window {
  cordova?: {
    plugins?: {
      fileOpener2?: {
        open: (
          filePath: string,
          mimeType: string,
          options: {
            error?: (e: any) => void;
            success?: () => void;
          }
        ) => void;
      };
      diagnostic?: {
        requestExternalStorageAuthorization: any;
        requestExternalStorageManagementPermission: () => void;
      };
    };
  };
}

// Extend Capacitor Permissions plugin types
declare module "@capacitor/permissions" {
  interface PermissionType {
    // Add 'storage' as a valid permission type
    storage: PermissionState;
  }
}
