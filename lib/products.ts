// import { subCategories } from "@/data/categories";
// import { products } from "@/data/product";
import type { ProductItem, SubCategory } from "@/types/product";

const PAGE_SIZE = 20;

export type ProductQueryParams = {
  page?: number;
  search?: string;
  category?: string;
  sku?: string;
};


interface ProductCategoriesResponse {
  success: boolean;
  data: SubCategory[];
  message?: string;
}

// export async function getAllProductCategories(): Promise<
//   SubCategory[]
// > {
//   try {
//     const baseUrl =
//       process.env.NEXT_PUBLIC_SITE_URL;

//     if (!baseUrl) {
//       throw new Error(
//         "NEXT_PUBLIC_SITE_URL is not configured."
//       );
//     }

//     const response = await fetch(
//       `${baseUrl}/api/store/categories`,
//       {
//         method: "GET",
//         cache: "no-store",
//       }
//     );

//     const result: ProductCategoriesResponse =
//       await response.json();

//     if (!response.ok || !result.success) {
//       throw new Error(
//         result.message ||
//           "Failed to fetch product categories."
//       );
//     }

//     return result.data ?? [];
//   } catch (error) {
//     console.error(
//       "getAllProductCategories error:",
//       error
//     );

//     return [];
//   }
// }

export async function getAllProductCategories(): Promise<SubCategory[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_SITE_URL is not configured.");
    }

    const url = `${baseUrl.replace(/\/$/, "")}/api/store/categories`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const responseBody = await response.text();

    // Detect HTML or other non-JSON responses before parsing.
    if (!contentType.includes("application/json")) {
      console.error("Product categories API returned a non-JSON response:", {
        url: response.url,
        status: response.status,
        redirected: response.redirected,
        contentType,
        body: responseBody.slice(0, 500),
      });

      throw new Error(
        `Expected JSON from ${url}, but received ${contentType || "an unknown content type"} (HTTP ${response.status}).`
      );
    }

    let result: ProductCategoriesResponse;

    try {
      result = JSON.parse(responseBody) as ProductCategoriesResponse;
    } catch {
      throw new Error("The product categories API returned invalid JSON.");
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || `Failed to fetch product categories (HTTP ${response.status}).`
      );
    }

    if (!Array.isArray(result.data)) {
      throw new Error("The product categories API returned an invalid data structure.");
    }

    return result.data;
  } catch (error) {
    console.error("getAllProductCategories error:", error);
    return [];
  }
}

export type ProductSortOption =
  | "Newest"
  | "Price Low To High"
  | "Price High To Low";

export function sortProducts(
  products: ProductItem[],
  sortBy: ProductSortOption
): ProductItem[] {
  const sorted = [...products];

  switch (sortBy) {
    case "Price Low To High":
      return sorted.sort(
        (a, b) =>
          Number(a.price ?? 0) -
          Number(b.price ?? 0)
      );

    case "Price High To Low":
      return sorted.sort(
        (a, b) =>
          Number(b.price ?? 0) -
          Number(a.price ?? 0)
      );

    case "Newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }
}

