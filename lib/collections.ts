import { CollectionItem } from "@/types/collection";

type CollectionsResponse = {
  success: boolean;
  data: CollectionItem[];
  message?: string;
};

export async function getCollections(): Promise<CollectionItem[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/store/collections`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const result: CollectionsResponse =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Failed to fetch collections."
      );
    }

    return result.data ?? [];
  } catch (error) {
    console.error(
      "getCollections error:",
      error
    );

    return [];
  }
}