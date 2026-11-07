import type { ProductColor, ProductSize } from "@/types/product";

export type StyleImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type StyleCollection = {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
};

export type StyleProductVariant = {
  id: string;
  sku: string;

  price: number;
  percentageDiscount: number;
  stock: number;

  color: ProductColor | null;
  size: ProductSize | null;
};

export type StyleProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type StyleProduct = {
  id: string;
  name: string;
  slug: string;

  shortDescription: string | null;
  longDescription: string | null;

  featuredImage: string | null;

  isActive: boolean;

  category: {
    id: string;
    name: string;
    slug: string;
  } | null;

  images: StyleProductImage[];

  variants: StyleProductVariant[];

  /**
   * Calculated pricing returned by
   * /api/store/outfits/slug/[slug]
   */
  price: number;
  oldPrice: number | null;
  discount: number;
  priceVariantId: string | null;

  inStock: boolean;

  /**
   * Convenience arrays derived from variants.
   */
  colors: ProductColor[];
  sizes: ProductSize[];
};

export type StyleProductItem = {
  sortOrder: number;
  product: StyleProduct;
};

export type StyleItem = {
  id: string;
  name: string;
  slug: string;

  shortDescription: string | null;
  longDescription: string | null;

  featuredImage: string | null;

  isActive: boolean;

  collection: StyleCollection | null;

  images: StyleImage[];

  products: StyleProductItem[];

  createdAt: string;
  updatedAt: string;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  coverImage: string | null;
};