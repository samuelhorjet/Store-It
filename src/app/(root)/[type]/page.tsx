import { initializeCapacitorPlugins } from "@/app/Capacitor-PLugins";
import Cardb from "@/Component/sections/Cardb";
import Sort from "@/Component/sections/Sort";
import Total from "@/Component/sections/total";
import { getFiles } from "@/lib/actions/file.actions";
import { getFileTypesParams } from "@/lib/utils";
import type { Models } from "node-appwrite";
import { useEffect } from "react";

 useEffect(() => {
   // Initialize Capacitor plugins when the app starts
   initializeCapacitorPlugins();
 }, []);

export async function generateStaticParams() {
  // Define all possible `type` values
  const types = ["documents", "images", "media", "others"];

  return types.map((type) => ({
    type,
  }));
}

interface SearchParamProps {
  params: {
    type?: string | string[];
  };
  searchParams: {
    query?: string | string[];
    sort?: string | string[];
  };
}

const Page = async ({ searchParams, params }: SearchParamProps) => {
  // Normalize `params.type`
  const rawType = params?.type;
  const type = Array.isArray(rawType) ? rawType[0] : rawType || "";

  // Normalize `searchParams.query` and `searchParams.sort`
  const rawQuery = searchParams?.query;
  const searchText = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery || "";

  const rawSort = searchParams?.sort;
  const sort = Array.isArray(rawSort) ? rawSort[0] : rawSort || "";

  const types = getFileTypesParams(type) as FileType[];
  const files = await getFiles({ types, searchText, sort });

  return (
    <div className="page-container">
      <section className="w-full mb-6">
        <h1 className="h1 capitalize">{type}</h1>
        <div className="total-size-section">
          <Total files={files.documents} />
          <div className="sort-container">
            <p className="body-1 hidden sm:block text-light-200">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>

      {files?.documents?.length > 0 ? (
        <section className="flex flex-wrap justify-center gap-4 items-start w-full min-h-[180px] overflow-y-auto custom-scrollbar">
          {files.documents.map((file: Models.Document) => (
            <Cardb key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <div className="empty-list">
          <p>No files Uploaded</p>
        </div>
      )}
    </div>
  );
};

export default Page;
