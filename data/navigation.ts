import { NavigationItem } from "@/types/navigation";


export const navigation: NavigationItem[] = [
  {
    label: "Shop",
    href: "/shop",
    sections: [
      {
        title: "Clothing",
        items: [
          "Shirts & Tops",
          "Shorts",
          "Pants",
          "Jackets & Coats",
          "Sweatshirts",
          "Jerseys",
          "Tracksuits"
        ],
      },
      {
        title: "Footwear",
        items: [
          "Sneakers",
          "Loafers",
          "Slides",
          "Sandals",
          "Low Profiles"
        ],
      },
      {
        title: "Accessories",
        items: [
          "Bags",
          "Sunglasses",
          "Hats",
          "Wristwear",
          "Socks"
        ],
      },
    ],
  },

  {
    label: "Styles",
    href: "/styles",
    sections: [
      {
        title: "Men",
        items: ["Casual", "Luxury", "Office", "Outdoor"],
      },
      {
        title: "Women",
        items: ["Dresses", "Bags", "Shoes", "Jewelry"],
      },
    ],
  },

  {
    label: "Collections",
    href: "/collections",
    sections: [
      {
        title: "Summer",
        items: ["Beach", "Travel", "Sports"],
      },
      {
        title: "Winter",
        items: ["Coats", "Boots", "Hoodies"],
      },
    ],
  },
];

export const categories = ["Headphones", "Speakers", "Watch", "Earbuds", "Mouse", "Decoration"];
//// MOBILE

import type { MenuPanel, MobileNavigationData } from "@/types/navigation";

const shopPanel: MenuPanel = {
  id: "shop",
  title: "Shop",
  layout: "list",
  sections: [
    {
      id: "clothing",
      title: "Clothing",
      entries: [
        { type: "link", id: "clothing-shirts", label: "Shirts & Tops", href: "/shop?category=tops&page=1" },
        { type: "link", id: "clothing-shorts", label: "Shorts", href: "/shop/clothing/shorts" },
        { type: "link", id: "clothing-pants", label: "Pants", href: "/shop/clothing/pants" },
        { type: "link", id: "clothing-jackets", label: "Jackets & Coats", href: "/shop/clothing/jackets-coats" },
      ],
    },
    {
      id: "footwear",
      title: "Footwear",
      entries: [
        { type: "link", id: "footwear-shirts", label: "Shirts & Tops", href: "/shop/footwear/shirts-tops" },
        { type: "link", id: "footwear-shorts", label: "Shorts", href: "/shop/footwear/shorts" },
        { type: "link", id: "footwear-pants", label: "Pants", href: "/shop/footwear/pants" },
        { type: "link", id: "footwear-jackets", label: "Jackets & Coats", href: "/shop/footwear/jackets-coats" },
      ],
    },
    {
      id: "accessories",
      title: "Accessories",
      entries: [
        { type: "link", id: "accessories-shirts", label: "Shirts & Tops", href: "/shop/accessories/shirts-tops" },
        { type: "link", id: "accessories-shorts", label: "Shorts", href: "/shop/accessories/shorts" },
        { type: "link", id: "accessories-pants", label: "Pants", href: "/shop/accessories/pants" },
        { type: "link", id: "accessories-jackets", label: "Jackets & Coats", href: "/shop/accessories/jackets-coats" },
      ],
    },
  ],
};

const stylesPanel: MenuPanel = {
  id: "styles",
  title: "Styles",
  layout: "card",
  card: {
    imageUrl: "/images/mobile-nav/styles-hero.jpg",
    imageAlt: "Model wearing a green jacket and orange trousers on outdoor steps",
    title: "Discover Your Style",
    description: "Find matching outfits for the summer and go there.",
    cta: { label: "Shop Styles", href: "/styles" },
  },
};

const collectionsPanel: MenuPanel = {
  id: "collections",
  title: "Collections",
  layout: "card",
  card: {
    imageUrl: "/images/mobile-nav/collections-hero.jfif",
    imageAlt: "Two people sitting courtside wearing 042 collection apparel",
    tags: [
      { type: "link", id: "collections-techno", label: "Techno Season", href: "/collections/techno-season" },
      { type: "link", id: "collections-samba", label: "Samba Style", href: "/collections/samba-style" },
      { type: "link", id: "collections-042", label: "042 Season", href: "/collections/042-season" },
      { type: "link", id: "collections-back-to-school", label: "Back To School", href: "/collections/back-to-school" },
      { type: "link", id: "collections-techno-2", label: "Techno Season", href: "/collections/techno-season-archive" },
      { type: "link", id: "collections-samba-2", label: "Samba Style", href: "/collections/samba-style-archive" },
      { type: "link", id: "collections-042-2", label: "042 Season", href: "/collections/042-season-archive" },
      { type: "link", id: "collections-back-to-school-2", label: "Back To School", href: "/collections/back-to-school-archive" },
    ],
  },
};

const rootPanel: MenuPanel = {
  id: "root",
  layout: "list",
  sections: [
    {
      id: "root-primary",
      entries: [
        { type: "group", id: "shop", label: "Shop", panel: shopPanel },
        { type: "group", id: "styles", label: "Styles", panel: stylesPanel },
        { type: "group", id: "collections", label: "Collections", panel: collectionsPanel },
      ],
    },
    {
      id: "root-footer",
      variant: "footer",
      entries: [
        { type: "link", id: "help", label: "Help", href: "/help" },
        { type: "link", id: "track-orders", label: "Track Orders", href: "/orders/track" },
        { type: "link", id: "sign-up", label: "Sign Up", href: "/account/sign-up" },
      ],
    },
  ],
};

export const mobileNavigation: MobileNavigationData = {
  rootPanel,
};
