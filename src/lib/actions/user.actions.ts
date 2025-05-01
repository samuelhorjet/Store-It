"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteconfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { parseStringify } from "@/lib/utils";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();  

  const result = await databases.listDocuments(
    appwriteconfig.databaseId,
    appwriteconfig.UserCollectionId,
    [Query.equal("email", [email])],
  );

  return result.total > 0 ? result.documents[0] : null;
}

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
}

const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }

}

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("failed to send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteconfig.databaseId,
      appwriteconfig.UserCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar:
          "https://i.pinimg.com/736x/fc/04/73/fc047347b17f7df7ff288d78c8c281cf.jpg",
        accountId,
      }
    );
  }

  return { accountId }; // ✅ Fix: Return accountId
};
