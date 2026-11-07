export type ProductColor = {
  id: string;
  name: string;
  label: string;
  hex: string;
};

export type ProductSize = {
  id: string;
  name: string;
  label: string;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
};

export type ProductItem = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  
  oldPrice: number;
  price: number;
  percentageDiscount: number;
  discount: number;

  longDescription: string;
  shortDescription: string;

  featuredImage: string;
  images: ProductImage[];

  colors: ProductColor[];
  sizes: ProductSize[];

  inStock: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type PrimaryCategory = {
  id: string;
  slug: string;
  name: string;
};

// export type SubCategory = {
//   id: string;
//   primaryCategoryId: string;
//   slug: string;
//   name: string;
// };

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;

  categoryGroup?: {
    id: string;
    name: string;
    slug: string;
  } | null;

  _count?: {
    products: number;
  };
}