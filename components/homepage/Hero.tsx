"use client";

import Image from "next/image";
import { motion, MotionConfig, type Variants } from "motion/react";
import { buttonVariants } from "@/components/ui/button";

const contentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const contentContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.12,
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
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const imageContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.16,
    },
  },
};

export default function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="bg-shadow-grey text-brand-white">
        <div className="mx-auto min-h-[calc(100svh-80px)] max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="grid min-h-[calc(100svh-104px)] grid-cols-1 items-center gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            {/* ------------------------------------------------
                LEFT — HERO CONTENT
            ------------------------------------------------ */}
            <motion.div
              variants={contentContainerVariants}
              initial="hidden"
              animate="visible"
              className="flex h-full flex-col justify-between py-4 lg:py-8"
            >
              <div className="overflow-hidden">
                <motion.h1
                  variants={contentVariants}
                  className="max-w-[440px] text-5xl leading-[0.95] font-bold tracking-[-0.04em] sm:text-6xl lg:text-[clamp(3.5rem,5vw,5rem)]"
                >
                  Make your
                  <br />
                  brand stick.
                </motion.h1>
              </div>

              {/* Description + Actions */}
              <motion.div
                variants={contentVariants}
                className="mt-12 max-w-sm lg:mt-0"
              >
                <p className="text-sm leading-[1.2] font-light tracking-[0.05em] text-white/80 md:text-lg">
                  Stickers, labels, packaging and print for businesses that
                  care how they show up.
                  <br />
                  Lagos, Nigeria with nationwide delivery.
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <motion.a
                    href="https://instagram.com/brandhauzstudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    className={buttonVariants({
                      className:
                        "h-9 rounded-none bg-tiger-flame px-5 text-xs font-medium text-brand-white",
                    })}
                  >
                    Instagram
                  </motion.a>

                  <motion.a
                    href="https://wa.me/2347048000567"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    className={buttonVariants({
                      variant: "outline",
                      className:
                        "h-9 rounded-none border-white/60 bg-transparent px-5 text-xs font-medium text-brand-white hover:bg-white hover:text-shadow-grey",
                    })}
                  >
                    WhatsApp
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>

            {/* ------------------------------------------------
                RIGHT — IMAGE COMPOSITION
            ------------------------------------------------ */}
            <motion.div
              variants={imageContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-[1.35fr_0.85fr] items-start gap-4 sm:gap-5 lg:gap-6"
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
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Image
                    src="/images/pages/lami-cup.webp"
                    alt="Branded LAMI coffee cup with custom sticker"
                    fill
                    priority
                    sizes="(max-width: 1024px) 65vw, 45vw"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>

              {/* Secondary image */}
              <motion.div
                variants={imageVariants}
                className="group relative aspect-square w-full overflow-hidden"
              >
                <motion.div
                  className="relative h-full w-full"
                  whileHover={{ scale: 1.03 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Image
                    src="/images/pages/body-butter.webp"
                    alt="Custom product labels being applied to body butter jars"
                    fill
                    priority
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