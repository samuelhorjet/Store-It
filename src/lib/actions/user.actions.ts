"use server";

import { createAdminClient } from "../appwrite";
import { ID, Query } from "node-appwrite";
import { appwriteconfig } from "../appwrite/config";

// Helper to handle errors
const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  // Return a stringified error object
  return JSON.stringify({
    error: message,
    details: error instanceof Error ? error.message : String(error),
  });
};

// Send OTP to email
const sendEmailOTP = async ({ email }: { email: string }): Promise<string> => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    console.error("Failed to send email OTP:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Get user by email
const getUserByEmail = async (email: string) => {
  try {
    // Validate required configuration
    if (!appwriteconfig.databaseId) {
      throw new Error(
        "Database ID is not configured. Please check your environment variables."
      );
    }

    if (!appwriteconfig.UserCollectionId) {
      throw new Error(
        "User Collection ID is not configured. Please check your environment variables."
      );
    }

    const { databases } = await createAdminClient();

    // Log database and collection IDs for debugging
    console.log("Database ID:", appwriteconfig.databaseId);
    console.log("User Collection ID:", appwriteconfig.UserCollectionId);

    const result = await databases.listDocuments(
      appwriteconfig.databaseId,
      appwriteconfig.UserCollectionId,
      [Query.equal("email", email)]
    );

    return result.total > 0 ? result.documents[0] : null;
  } catch (error) {
    console.error("Failed to get user by email:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Create user account
export const createAccount = async ({
  FullName,
  email,
}: {
  FullName: string;
  email: string;
}): Promise<string> => {
  try {
    // Log config for debugging
    console.log("Appwrite Config:", {
      databaseId: appwriteconfig.databaseId,
      UserCollectionId: appwriteconfig.UserCollectionId,
      endpointUrl: appwriteconfig.endpointUrl,
      projectId: appwriteconfig.projectId,
    });

    // Try to get existing user
    let existingUser;
    try {
      existingUser = await getUserByEmail(email);
    } catch (error) {
      return handleError(error, "Failed to check for existing user");
    }

    // Try to send OTP
    let accountId;
    try {
      accountId = await sendEmailOTP({ email });
    } catch (error) {
      return handleError(error, "Failed to send an OTP");
    }

    if (!accountId) {
      return JSON.stringify({ error: "Failed to send an OTP" });
    }

    // Create user if they don't exist
    if (!existingUser) {
      try {
        // Validate required configuration
        if (!appwriteconfig.databaseId) {
          throw new Error(
            "Database ID is not configured. Please check your environment variables."
          );
        }

        if (!appwriteconfig.UserCollectionId) {
          throw new Error(
            "User Collection ID is not configured. Please check your environment variables."
          );
        }

        const { databases } = await createAdminClient();
        await databases.createDocument(
          appwriteconfig.databaseId,
          appwriteconfig.UserCollectionId,
          ID.unique(),
          {
            fullname: FullName,
            email,
            avatar:
              "https://www.shutterstock.com/image-vector/young-smiling-man-avatar-3d-600nw-2124054758.jpg",
            accountid: accountId,
          }
        );
      } catch (error) {
        return handleError(error, "Failed to create user document");
      }
    }

    return JSON.stringify({ accountId });
  } catch (error) {
    return handleError(error, "Failed to create account");
  }
};
