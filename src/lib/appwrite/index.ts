"use server";

import { cookies } from "next/headers";
import { appwriteconfig } from "./config";
import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";

// Helper function to validate URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const createSectionClient = async () => {
  // Validate endpoint URL
  if (!appwriteconfig.endpointUrl || !isValidUrl(appwriteconfig.endpointUrl)) {
    console.error("Invalid endpoint URL:", appwriteconfig.endpointUrl);
    throw new Error(
      `Invalid endpoint URL: ${appwriteconfig.endpointUrl}. Please check your environment variables.`
    );
  }

  // Validate project ID
  if (!appwriteconfig.projectId) {
    console.error("Missing project ID");
    throw new Error(
      "Missing project ID. Please check your environment variables."
    );
  }

  // Log config for debugging
  console.log("Creating section client with config:", {
    endpointUrl: appwriteconfig.endpointUrl,
    projectId: appwriteconfig.projectId,
  });

  const client = new Client()
    .setEndpoint(appwriteconfig.endpointUrl)
    .setProject(appwriteconfig.projectId);

  const session = (await cookies()).get("appwrite-session");

  if (!session || !session.value) {
    throw new Error("No Session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
};

export const createAdminClient = async () => {
  // Validate endpoint URL
  if (!appwriteconfig.endpointUrl || !isValidUrl(appwriteconfig.endpointUrl)) {
    console.error("Invalid endpoint URL:", appwriteconfig.endpointUrl);
    throw new Error(
      `Invalid endpoint URL: ${appwriteconfig.endpointUrl}. Please check your environment variables.`
    );
  }

  // Validate project ID
  if (!appwriteconfig.projectId) {
    console.error("Missing project ID");
    throw new Error(
      "Missing project ID. Please check your environment variables."
    );
  }

  // Validate API key
  if (!appwriteconfig.keyId) {
    console.error("Missing API key");
    throw new Error(
      "Missing API key. Please check your environment variables."
    );
  }

  // Log config for debugging
  console.log("Creating admin client with config:", {
    endpointUrl: appwriteconfig.endpointUrl,
    projectId: appwriteconfig.projectId,
    keyId: appwriteconfig.keyId ? "Set (redacted)" : "Missing",
  });

  try {
    const client = new Client()
      .setEndpoint(appwriteconfig.endpointUrl)
      .setProject(appwriteconfig.projectId)
      .setKey(appwriteconfig.keyId);

    return {
      get account() {
        return new Account(client);
      },
      get databases() {
        return new Databases(client);
      },
      get storage() {
        return new Storage(client);
      },
      get avatars() {
        return new Avatars(client);
      },
    };
  } catch (error) {
    console.error("Error creating admin client:", error);
    throw error;
  }
};
