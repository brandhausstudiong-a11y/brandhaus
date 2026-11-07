export interface TestCollectionItem {
  title: string;
  href: string;
}


export interface NavSection {
  title: string;
  items: string[];
}


export interface NavigationItem {
  label: string;
  href: string;
  sections: NavSection[];
}


/**
 * Types for the full-screen, drill-down mobile navigation menu
 * (Zara / H&M / Nike / Adidas / Shopify pattern).
 *
 * The core idea: a `MenuPanel` contains `MenuEntry[]`, and a `MenuEntry`
 * can either be a plain link OR a "group" that points at another
 * `MenuPanel`. Because `MenuGroupEntry.panel` is itself a `MenuPanel`,
 * this recurses arbitrarily deep — nesting isn't hardcoded to 2 levels,
 * a group's panel can contain groups of its own, and so on.
 */

/** A plain navigable link — tapping it goes to `href`, no nested panel. */
export interface MenuLinkEntry {
  type: "link";
  id: string;
  label: string;
  href: string;
}

/** An entry that opens another panel (rendered with a trailing chevron). */
export interface MenuGroupEntry {
  type: "group";
  id: string;
  label: string;
  panel: MenuPanel;
}

export type MenuEntry = MenuLinkEntry | MenuGroupEntry;

/** A titled (or untitled) group of entries within a panel, e.g. "Clothing". */
export interface MenuSection {
  id: string;
  /** Omit for an untitled section (e.g. the root panel's Shop/Styles/Collections list). */
  title?: string;
  /** `footer` renders smaller, muted links (Help / Track Orders / Sign Up). */
  variant?: "default" | "footer";
  entries: MenuEntry[];
}

/** Hero-card content for panels like "Styles" or "Collections". */
export interface MenuCardContent {
  imageUrl: string;
  imageAlt: string;
  title?: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
  /** A simple link list rendered below the image (used by the Collections panel). */
  tags?: MenuLinkEntry[];
}

/** A single screen in the navigation stack. */
export interface MenuPanel {
  id: string;
  /** Shown in the header. Root panel typically omits this in favor of the logo. */
  title?: string;
  layout: "list" | "card";
  sections?: MenuSection[];
  card?: MenuCardContent;
}

/** Top-level data shape consumed by <MobileMenu />. */
export interface MobileNavigationData {
  rootPanel: MenuPanel;
}
