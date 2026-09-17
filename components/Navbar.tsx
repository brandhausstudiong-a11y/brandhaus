"use client";

import Image from "next/image";
import * as React from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import {
  motion,
  MotionConfig,
  type Variants,
} from "motion/react";

/* ============================================================
   NAVIGATION
============================================================ */

const navigation = [
  {
    label: "What we do",
    href: "/#what-we-do",
  },
  {
    label: "Difference",
    href: "/#difference",
  },
  {
    label: "How it works",
    href: "/#how-it-works",
  },
  {
    label: "Industries",
    href: "/#industries",
  },
  {
    label: "Contact",
    href: "/#contact",
  },
];

/* ============================================================
   ANIMATION VARIANTS
============================================================ */

/* ---------- Logo ---------- */

const logoVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -12,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

/* ---------- Desktop Navigation ---------- */

const desktopLinksVariants: Variants = {
  hidden: {},

  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.08,
    },
  },
};

const desktopLinkVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

/* ---------- Mobile Menu ---------- */

const overlayVariants: Variants = {
  closed: {
    opacity: 0,
  },

  open: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const sidebarVariants: Variants = {
  closed: {
    x: "100%",
  },

  open: {
    x: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const mobileHeaderVariants: Variants = {
  closed: {
    opacity: 0,
    y: -12,
  },

  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
      delay: 0.15,
    },
  },
};

const mobileNavVariants: Variants = {
  closed: {},

  open: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.08,
    },
  },
};

const mobileNavItemVariants: Variants = {
  closed: {
    opacity: 0,
    x: 20,
  },

  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const mobileBottomVariants: Variants = {
  closed: {
    opacity: 0,
    y: 15,
  },

  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.45,
    },
  },
};

/* ============================================================
   COMPONENT
============================================================ */

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  /* Prevent body scrolling while the mobile sidebar is open. */
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <>
        {/* ====================================================
            NAVBAR
        ==================================================== */}

        <header className="relative z-50 w-full bg-shadow-grey text-brand-white">
          <nav className="w-full">
            <div className="mx-auto flex h-16 w-full items-center justify-between px-6 sm:px-8 lg:px-10">

              {/* ==================================================
                  LOGO
              ================================================== */}

              <motion.div
                variants={logoVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href="/"
                  className="group flex w-fit items-start"
                  aria-label="BrandHaus Studio"
                >
                  <Image
                    src="/images/brand/wordmark-white.png"
                    alt="BrandHaus Studio"
                    width={461}
                    height={170}
                    priority
                    className="h-auto w-[75px] object-contain transition-opacity duration-200 group-hover:opacity-80 md:w-[75px]"
                  />
                </Link>
              </motion.div>

              {/* ==================================================
                  DESKTOP NAV
              ================================================== */}

              <motion.div
                variants={desktopLinksVariants}
                initial="hidden"
                animate="visible"
                className="hidden items-center gap-1 md:flex"
              >
                {/* WhatsApp */}

                <motion.a
                  variants={desktopLinkVariants}
                  href="https://wa.me/2347048000567"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="text-[14px] font-medium text-white/90 transition-colors hover:text-tiger-flame"
                >
                  WhatsApp
                </motion.a>

                <motion.span
                  variants={desktopLinkVariants}
                  className="mx-1 text-[14px] text-white/40"
                >
                  |
                </motion.span>

                {/* Instagram */}

                <motion.a
                  variants={desktopLinkVariants}
                  href="https://instagram.com/brandhauzstudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="text-[14px] font-medium text-white/90 transition-colors hover:text-tiger-flame"
                >
                  Instagram
                </motion.a>

                <motion.span
                  variants={desktopLinkVariants}
                  className="mx-1 text-[14px] text-white/40"
                >
                  |
                </motion.span>

                {/* TikTok */}

                <motion.a
                  variants={desktopLinkVariants}
                  href="https://tiktok.com/@brandhauzstudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="text-[14px] font-medium text-white/90 transition-colors hover:text-tiger-flame"
                >
                  Tiktok
                </motion.a>
              </motion.div>

              {/* ==================================================
                  MOBILE MENU BUTTON
              ================================================== */}

              <motion.button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={isOpen}
                whileTap={{ scale: 0.9 }}
                className="flex h-9 w-9 items-center justify-center text-brand-white md:hidden"
              >
                <Menu
                  size={24}
                  strokeWidth={1.5}
                />
              </motion.button>
            </div>
          </nav>
        </header>

        {/* ====================================================
            MOBILE SIDEBAR
        ==================================================== */}

        <div
          className={[
            "fixed inset-0 z-[60] md:hidden",
            isOpen
              ? "pointer-events-auto"
              : "pointer-events-none",
          ].join(" ")}
        >
          {/* ==================================================
              OVERLAY
          ================================================== */}

          <motion.button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
            initial={false}
            animate={isOpen ? "open" : "closed"}
            variants={overlayVariants}
            className="absolute inset-0 bg-shadow-grey/30 backdrop-blur-[2px]"
          />

          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <motion.aside
            initial={false}
            animate={isOpen ? "open" : "closed"}
            variants={sidebarVariants}
            className="absolute top-0 right-0 h-full w-[min(88vw,420px)] bg-parchment text-shadow-grey"
          >
            <div className="flex h-full flex-col px-6 py-7 sm:px-8">

              {/* ==================================================
                  SIDEBAR HEADER
              ================================================== */}

              <motion.div
                variants={mobileHeaderVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                className="flex items-start justify-between"
              >
                {/* Brand mark */}

                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex items-start gap-2"
                >
                  <Image
                    src="/images/brand/logomark-v2.png"
                    alt="BrandHaus Studio"
                    width={601}
                    height={266}
                    priority
                    className="h-auto w-[150px] object-contain"
                  />
                </Link>

                {/* Close */}

                <motion.button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close navigation menu"
                  whileTap={{ scale: 0.9 }}
                  className="flex h-9 w-9 items-center justify-center"
                >
                  <X
                    size={21}
                    strokeWidth={1.5}
                  />
                </motion.button>
              </motion.div>

              {/* ==================================================
                  NAVIGATION
              ================================================== */}

              <motion.nav
                className="mt-20"
                variants={mobileNavVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
              >
                <ul>
                  {navigation.map((item) => (
                    <motion.li
                      key={item.label}
                      variants={mobileNavItemVariants}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="group flex items-center justify-between border-b border-shadow-grey/50 py-4 text-[15px] font-medium"
                      >
                        <motion.span
                          whileHover={{ x: 4 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                        >
                          {item.label}
                        </motion.span>

                        <motion.div
                          initial={{
                            opacity: 0,
                            x: -4,
                          }}
                          whileHover={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            duration: 0.2,
                          }}
                        >
                          <ArrowUpRight
                            size={15}
                            strokeWidth={1.4}
                          />
                        </motion.div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              {/* ==================================================
                  BOTTOM CONTENT
              ================================================== */}

              <motion.div
                variants={mobileBottomVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                className="mt-auto"
              >
                <div className="mb-6 flex items-center gap-4">

                  <a
                    href="https://instagram.com/brandhauzstudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-[11px] font-semibold transition-colors hover:text-tiger-flame"
                  >
                    Instagram
                  </a>

                  <a
                    href="https://tiktok.com/@brandhauzstudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="text-[11px] font-semibold transition-colors hover:text-tiger-flame"
                  >
                    TikTok
                  </a>

                  <a
                    href="https://wa.me/2347048000567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold transition-colors hover:text-tiger-flame"
                  >
                    WhatsApp
                  </a>

                </div>

                <p className="max-w-[210px] text-[17px] font-semibold leading-[1.05] tracking-[-0.03em]">
                  Where Great Brands
                  <br />
                  Come to Life.
                </p>

                <p className="mt-4 text-[9px] text-shadow-grey/60">
                  Lagos, Nigeria
                </p>
              </motion.div>

            </div>
          </motion.aside>
        </div>
      </>
    </MotionConfig>
  );
}