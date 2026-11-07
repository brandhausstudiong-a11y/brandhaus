export type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  categoryGroupId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;

  shortDescription: string | null;
  longDescription: string | null;
  featuredImage: string | null;

  isActive: boolean;

  categoryId: string | null;

  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;

  productId: string;
  product: Product;

  sku: string;

  colorId: string | null;
  color: ProductColor | null;

  sizeId: string | null;
  size: ProductSize | null;

  price: number;
  percentageDiscount: number;
  stock: number;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type ProductColor = {
  id: string;
  name: string;
  label: string;
  hex: string;

  variants: ProductVariant[];

  createdAt: string;
  updatedAt: string;
};

export type ProductSize = {
  id: string;
  name: string;
  label: string;

  variants: ProductVariant[];

  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;

  productId: string;
  product: Product;

  sortOrder: number;

  createdAt: string;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;

  outfits: Outfit[];

  createdAt: string;
  updatedAt: string;
};

export type Outfit = {
  id: string;
  name: string;
  slug: string;

  longDescription: string | null;
  shortDescription: string | null;
  featuredImage: string | null;

  isActive: boolean;

  collectionId: string | null;
  collection: Collection | null;

  images: OutfitImage[];
  products: OutfitProduct[];

  createdAt: string;
  updatedAt: string;
};

export type OutfitImage = {
  id: string;
  url: string;
  alt: string | null;

  outfitId: string;
  outfit: Outfit;

  sortOrder: number;

  createdAt: string;
};

export type OutfitProduct = {
  outfitId: string;
  productId: string;

  outfit: Outfit;
  product: Product;

  sortOrder: number;
};