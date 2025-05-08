"use client";

import Link from "next/link";
import type { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";
import { useEffect, useState } from "react";
import { getOwnerById } from "@/lib/actions/owner.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import Dropdown from "./Dropdown";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteconfig } from "@/lib/appwrite/config";

const Cardb = ({ file }: { file: Models.Document }) => {
  const [ownerName, setOwnerName] = useState<string>("Loading...");

  useEffect(() => {
    const fetchOwner = async () => {
      // Always try to get the owner from the file.owner field first
      if (file.owner === null) {
        try {
          const currentUser = await getCurrentUser();
          setOwnerName(currentUser?.fullName || "You");
        } catch {
          setOwnerName("You");
        }
        return;
      }

      // If we have an owner ID, try to get the owner data
      if (typeof file.owner === "string" && file.owner) {
        try {
          const ownerData = await getOwnerById(file.owner);
          if (ownerData && ownerData.fullName) {
            setOwnerName(ownerData.fullName);

            // If the file doesn't have an $ownerName field, update it
            if (!file.$ownerName) {
              const { databases } = await createAdminClient();
              await databases.updateDocument(
                appwriteconfig.databaseId,
                appwriteconfig.filesCollectionId,
                file.$id,
                {
                  $ownerName: ownerData.fullName,
                }
              );
            }
          } else {
            setOwnerName("Unknown");
          }
        } catch {
          setOwnerName("Unknown");
        }
      } else if (typeof file.owner === "object" && file.owner?.fullName) {
        setOwnerName(file.owner.fullName);
      } else if (file.$ownerName) {
        // Use the cached owner name if available
        setOwnerName(file.$ownerName);
      } else {
        setOwnerName("Unknown");
      }
    };

    fetchOwner();
  }, [file]);

  return (
    <Link
      href={file.url}
      target="_blank"
      className="file-card block bg-dark-500 p-4 rounded-xl shadow-md transition hover:shadow-lg overflow-hidden w-full"
    >
      <div className="flex justify-between items-start w-full gap-4">
        {/* Left: Thumbnail and Info */}
        <div className="flex gap-4 max-w-[70%] items-center">
          <Thumbnail
            type={file.type}
            extension={file.extension}
            url={file.url}
            imageClassName="!size-16 rounded-full" // Bigger, circular image
            className="!size-16 rounded-full"
          />

          <div className="flex flex-col gap-2 justify-between text-sm md:text-base">
            <p className="font-medium break-words text-light-100 md:subtitle-2">
              {file.name}
            </p>
            <FormattedDateTime
              date={file.$createdAt}
              className="text-light-200"
            />
            <p className="text-light-200 break-words text-xs md:text-sm">
              By: {ownerName}
            </p>
          </div>
        </div>

        {/* Right: Actions & Size */}
        <div className="flex flex-col items-end justify-between h-full">
          <Dropdown file={file} />
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>
    </Link>
  );
};

export default Cardb;
