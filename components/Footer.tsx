"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  MotionConfig,
  type Variants,
} from "motion/react";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/brandhauzstudio",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@brandhauzstudio",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/2347048000567",
  },
];

/* ============================================================
   ANIMATION VARIANTS
============================================================ */

const footerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.12,
    },
  },
};

const contentItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const brandMarkVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 25,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const ctaVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 25,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const copyrightVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const Footer = () => {
  return (
    <MotionConfig reducedMotion="user">
      <footer
        className="bg-parchment text-shadow-grey"
        id="contact"
      >
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">

          {/* ==================================================
              MAIN FOOTER
          ================================================== */}

          <motion.div
            variants={footerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.25,
            }}
            className="border border-dashed border-shadow-grey/50 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-11"
          >
            <div className="flex flex-col justify-between gap-12 md:flex-row md:items-end">

              {/* ==================================================
                  LEFT — BRAND
              ================================================== */}

              <div className="flex flex-col justify-between gap-12">

                {/* Brand mark */}
                <motion.div variants={brandMarkVariants}>
                  <Link
                    href="/"
                    aria-label="BrandHaus Studio"
                    className="group flex w-fit items-start"
                  >
                    <Image
                      src="/images/brand/logomark-v2.png"
                      alt="BrandHaus Studio"
                      width={601}
                      height={266}
                      priority
                      className="h-auto w-[400px] object-contain transition-opacity duration-200 group-hover:opacity-80"
                    />
                  </Link>
                </motion.div>

                {/* Social links */}
                <motion.nav
                  variants={contentItemVariants}
                  aria-label="Social media"
                  className="flex flex-wrap items-center gap-x-1.5 text-[14px] leading-none"
                >
                  {socialLinks.map((link, index) => (
                    <motion.div
                      key={link.label}
                      whileHover={{ y: -2 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <Link
                        href={link.href}
                        target={
                          link.href.startsWith("http")
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          link.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="transition-colors hover:text-tiger-flame"
                      >
                        {link.label}
                      </Link>

                      {index < socialLinks.length - 1 && (
                        <span aria-hidden="true">|</span>
                      )}
                    </motion.div>
                  ))}
                </motion.nav>
              </div>

              {/* ==================================================
                  RIGHT — CTA
              ================================================== */}

              <motion.div
                variants={ctaVariants}
                className="max-w-[280px]"
              >
                <h2 className="text-4xl leading-[0.95] font-bold tracking-[-0.04em] sm:text-5xl">
                  Make your
                  <br />
                  brand stick.
                </h2>

                <p className="mt-7 max-w-[260px] text-sm leading-[1.2] font-light tracking-[0.05em] text-shadow-grey/80 md:text-lg">
                  Stickers, labels, packaging and print for brands that care
                  how they show up.
                </p>

                {/* WhatsApp CTA */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <Link
                    href="https://wa.me/2347048000567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-6 inline-flex h-9 items-center gap-2 border border-shadow-grey bg-transparent px-4 text-sm font-medium transition-colors hover:bg-shadow-grey hover:text-brand-white"
                  >
                    Chat us on WhatsApp

                    <ArrowUpRight
                      size={13}
                      strokeWidth={1.5}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </motion.div>
              </motion.div>

            </div>
          </motion.div>

          {/* ==================================================
              COPYRIGHT
          ================================================== */}

          <motion.div
            variants={copyrightVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.5,
            }}
            className="mt-4 flex flex-col gap-2 text-[14px] leading-none sm:flex-row sm:items-center sm:justify-between"
          >
            <p>
              © {new Date().getFullYear()} BrandHaus Studio. All rights
              reserved.
            </p>

            <p className="text-shadow-grey/60">
              Lagos, Nigeria · Nationwide delivery
            </p>
          </motion.div>

        </div>
      </footer>
    </MotionConfig>
  );
};

export default Footer;