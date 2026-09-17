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

export default function WhatWeDo() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        className="bg-parchment text-shadow-grey"
        id="what-we-do"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">

            {/* ==================================================
                LEFT CONTENT
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
                className="text-md font-semibold tracking-tight text-shadow-grey"
              >
                What we do
              </motion.span>

              {/* Heading */}
              <motion.h2
                variants={contentItemVariants}
                className="mt-4 max-w-xl text-4xl leading-[0.98] font-bold tracking-[-0.04em] sm:text-5xl lg:text-[clamp(3rem,4.5vw,4.5rem)]"
              >
                From your brand to the physical world.
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={contentItemVariants}
                className="mt-5 max-w-md text-sm leading-[1.2] font-light tracking-[0.05em] text-shadow-grey/80 md:text-lg"
              >
                We create stickers, labels, packaging and print that give
                your brand something customers can see, touch and remember.
              </motion.p>

              {/* Actions */}
              <motion.div
                variants={contentItemVariants}
                className="mt-5 flex items-center gap-3"
              >
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
              </motion.div>

              {/* ==================================================
                  SMALL IMAGE
              ================================================== */}

              <motion.div
                variants={smallImageVariants}
                className="mt-10 w-full max-w-[280px] sm:mt-12"
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                  className="relative aspect-square w-full overflow-hidden"
                >
                  <Image
                    src="/images/pages/peanut-one.webp"
                    alt="Creative brand materials and printed assets"
                    fill
                    sizes="(max-width: 640px) 70vw, 280px"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ==================================================
                LARGE IMAGE
            ================================================== */}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
              }}
              variants={imageVariants}
              className="lg:pt-0"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="relative aspect-[1.08] w-full overflow-hidden"
              >
                <Image
                  src="/images/pages/peanut-two.webp"
                  alt="Customers interacting with branded physical products"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>
    </MotionConfig>
  );
}