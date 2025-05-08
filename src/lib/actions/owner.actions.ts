"use server";

import { createAdminClient } from "../appwrite";
import { appwriteconfig } from "../appwrite/config";
import { parseStringify } from "../utils";

// Function to get owner by ID
export const getOwnerById = async (ownerId: string) => {
  try {
    console.log("Fetching owner with ID:", ownerId);
    console.log("Database ID:", appwriteconfig.databaseId);
    console.log("User Collection ID:", appwriteconfig.UserCollectionId);

    if (!ownerId) {
      console.error("Invalid owner ID provided");
      return null;
    }

    const { databases } = await createAdminClient();

    // Try to fetch the user document from the Users collection
    try {
      const user = await databases.getDocument(
        appwriteconfig.databaseId,
        appwriteconfig.UserCollectionId,
        ownerId
      );
      console.log("Found user:", user ? user.fullName : "No user found");
      return parseStringify(user);
    } catch (docError) {
      console.error("Error fetching user document:", docError);

      // Try listing documents to see if we can find the user by ID
      try {
        const { Query } = await import("node-appwrite");
        const users = await databases.listDocuments(
          appwriteconfig.databaseId,
          appwriteconfig.UserCollectionId,
          [Query.equal("$id", [ownerId])]
        );

        console.log(`Found ${users.total} users with ID ${ownerId}`);

        if (users.total > 0) {
          console.log("Found user via query:", users.documents[0].fullName);
          return parseStringify(users.documents[0]);
        }

        // Try to find by accountId instead
        const usersByAccountId = await databases.listDocuments(
          appwriteconfig.databaseId,
          appwriteconfig.UserCollectionId,
          [Query.equal("accountId", [ownerId])]
        );

        console.log(
          `Found ${usersByAccountId.total} users with accountId ${ownerId}`
        );

        if (usersByAccountId.total > 0) {
          console.log(
            "Found user via accountId:",
            usersByAccountId.documents[0].fullName
          );
          return parseStringify(usersByAccountId.documents[0]);
        }
      } catch (listError) {
        console.error("Error listing users:", listError);
      }

      return null;
    }
  } catch (error) {
    console.error("Error fetching owner:", error);
    return null;
  }
};
