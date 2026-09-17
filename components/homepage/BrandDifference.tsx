"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  MotionConfig,
  type Variants,
} from "motion/react";
import { buttonVariants } from "@/components/ui/button";

/* ============================================================
   ANIMATION VARIANTS
============================================================ */

const contentContainerVariants: Variants = {
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

const imageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: "easeOut",
    },
  },
};

const smallImageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.97,
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

export default function BrandDifference() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        className="bg-parchment text-shadow-grey"
        id="difference"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

            {/* ==================================================
                LEFT — CONTENT
            ================================================== */}

            <motion.div
              variants={contentContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.25,
              }}
              className="flex flex-col"
            >
              {/* Section label */}
              <motion.span
                variants={contentItemVariants}
                className="text-md font-semibold tracking-tight"
              >
                Difference
              </motion.span>

              {/* Heading */}
              <motion.h2
                variants={contentItemVariants}
                className="mt-4 max-w-md text-4xl leading-[0.98] font-bold tracking-[-0.04em] sm:text-5xl lg:text-[clamp(3rem,4.5vw,4.5rem)]"
              >
                Print is part of
                <br />
                your brand.
              </motion.h2>

              {/* Description + CTA */}
              <motion.div
                variants={contentItemVariants}
                className="mt-12 lg:mt-auto lg:pt-32"
              >
                <p className="max-w-md text-sm leading-[1.2] font-light tracking-[0.05em] text-shadow-grey/80 md:text-lg">
                  We pay attention to the details, the material, finish,
                  shape and presentation, so the things carrying your brand
                  feel as considered as the brand itself.
                </p>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-3">
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
                      className={buttonVariants({
                        className:
                          "h-9 rounded-none border border-shadow-grey bg-transparent px-4 text-sm font-medium text-shadow-grey hover:bg-shadow-grey hover:text-brand-white",
                      })}
                    >
                      WhatsApp
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                  >
                    <Link
                      href="https://instagram.com/brandhauzstudio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-9 items-center gap-1 px-1 text-sm font-medium text-shadow-grey"
                    >
                      Instagram

                      <ArrowRight
                        size={13}
                        strokeWidth={1.5}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* ==================================================
                RIGHT — IMAGE COMPOSITION
            ================================================== */}

            <motion.div
              variants={contentContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
              }}
              className="grid grid-cols-[1fr_0.62fr] items-start gap-4 sm:gap-5 lg:gap-6"
            >
              {/* Main image */}
              <motion.div
                variants={imageVariants}
                className="group relative aspect-[0.72] w-full overflow-hidden"
              >
                <motion.div
                  className="relative h-full w-full"
                  whileHover={{ scale: 1.03 }}
                  transition={{
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                >
                  <Image
                    src="/images/pages/soap-one.webp"
                    alt="BrandHaus team working together"
                    fill
                    sizes="(max-width: 1024px) 65vw, 45vw"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>

              {/* Small image */}
              <motion.div
                variants={smallImageVariants}
                className="group relative mt-0 aspect-square w-full overflow-hidden"
              >
                <motion.div
                  className="relative h-full w-full"
                  whileHover={{ scale: 1.03 }}
                  transition={{
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                >
                  <Image
                    src="/images/pages/print.webp"
                    alt="Creative team collaborating on brand materials"
                    fill
                    sizes="(max-width: 1024px) 35vw, 25vw"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>
    </MotionConfig>
  );
}