"use client";

import Link from "next/link";
import {
  motion,
  MotionConfig,
  type Variants,
} from "motion/react";

const industries = [
  {
    number: "01",
    title: "Food & Beverage",
    href: "/#industries",
  },
  {
    number: "02",
    title: "Beauty & Skincare",
    href: "/#industries",
  },
  {
    number: "03",
    title: "Fashion & Retail",
    href: "/#industries",
  },
  {
    number: "04",
    title: "Product Brands",
    href: "/#industries",
  },
];

/* ============================================================
   ANIMATION VARIANTS
============================================================ */

const labelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
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

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

const rowVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut",
    },
  },
};

export default function Industries() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="industries"
        className="bg-parchment text-shadow-grey"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">

          {/* ==================================================
              SECTION LABEL
          ================================================== */}

          <motion.div
            variants={labelVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.5,
            }}
            className="mb-6"
          >
            <span className="text-md font-semibold tracking-tight">
              Industries
            </span>
          </motion.div>

          {/* ==================================================
              INDUSTRIES LIST
          ================================================== */}

          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.25,
            }}
            className="border-b border-shadow-grey/70"
          >
            {industries.map((industry) => (
              <motion.div
                key={industry.number}
                variants={rowVariants}
              >
                <Link
                  href={industry.href}
                  className="group flex items-center border-t border-shadow-grey/70 py-4 transition-colors duration-200 sm:py-5 lg:py-[14px]"
                >
                  {/* Number */}
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    className="w-7 shrink-0 text-[14px] font-semibold leading-none sm:w-9 sm:text-[11px]"
                  >
                    {industry.number}
                  </motion.span>

                  {/* Title */}
                  <motion.span
                    whileHover={{ x: 4 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    className="text-[21px] font-semibold leading-none tracking-[-0.025em] transition-colors duration-200 group-hover:text-tiger-flame sm:text-2xl lg:text-[25px]"
                  >
                    {industry.title}
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>
    </MotionConfig>
  );
}