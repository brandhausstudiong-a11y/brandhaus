"use client";

import Image from "next/image";
import Link from "next/link";
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

export default function StartProject() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="bg-shadow-grey text-brand-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-16">

            {/* ==================================================
                CONTENT
            ================================================== */}

            <motion.div
              variants={contentContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.3,
              }}
              className="max-w-xl"
            >
              {/* Heading */}
              <motion.h2
                variants={contentItemVariants}
                className="text-4xl leading-[0.98] font-bold tracking-[-0.04em] sm:text-5xl lg:text-[clamp(3rem,4vw,4.25rem)]"
              >
                Start a project
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={contentItemVariants}
                className="mt-5 max-w-lg text-sm leading-[1.2] font-light tracking-[0.05em] text-white/80 md:text-lg"
              >
                Your brand deserves to be held. Tell us what you are making
                and we will bring it into the physical world.
              </motion.p>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <motion.div
                variants={contentItemVariants}
                className="mt-5 flex items-center gap-2"
              >
                {/* Instagram */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                <a
                  href={process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    className:
                      "h-9 rounded-none bg-tiger-flame px-5 text-sm font-medium text-brand-white hover:bg-tiger-flame/90",
                  })}
                >
                  Instagram
                </a>
                </motion.div>

                {/* WhatsApp */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                <a
                  href={process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    className:
                      "h-9 rounded-none border-white/60 bg-transparent px-5 text-sm font-medium text-brand-white hover:bg-brand-white hover:text-shadow-grey",
                  })}
                >
                  WhatsApp
                </a>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ==================================================
                IMAGE
            ================================================== */}

            <motion.div
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.25,
              }}
              className="w-full lg:justify-self-end"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="relative aspect-[1.58] w-full overflow-hidden"
              >
                <Image
                  src="/images/pages/stickers.webp"
                  alt="BrandHaus custom stickers being held by hand"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
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