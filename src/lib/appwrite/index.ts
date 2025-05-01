"use server"

import { Account, Avatars, Client, Databases, Storage } from "node-appwrite"
import { appwriteconfig } from "@/lib/appwrite/config"
import { cookies } from "next/headers"

export const createSectionClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteconfig.endpointUrl)
    .setProject(appwriteconfig.projectId)
  
  const session = (await cookies()).get("appwrite-session");

  if (!session || !session.value) throw new Error("No session");

  client.setSession(session.value);


  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    }
  }
}

export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteconfig.endpointUrl)
    .setProject(appwriteconfig.projectId)
    .setKey(appwriteconfig.secretkey)

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
    }
  }
}