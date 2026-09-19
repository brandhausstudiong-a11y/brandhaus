"use client";

import Link from "next/link";
import {
  Share2,
  Triangle,
  UserRound,
  Printer,
  ArrowRight,
} from "lucide-react";
import {
  motion,
  MotionConfig,
  type Variants,
} from "motion/react";
import { buttonVariants } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Tell us what you need",
    description: "Share your idea, artwork or requirements.",
    icon: Share2,
  },
  {
    number: "02",
    title: "Get your proof",
    description: "We review the details and prepare your proof.",
    icon: Triangle,
  },
  {
    number: "03",
    title: "Approve",
    description: "You confirm the final design and specifications.",
    icon: UserRound,
  },
  {
    number: "04",
    title: "We make it",
    description: "We print, finish and get it ready for you.",
    icon: Printer,
  },
];

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

const stepsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.14,
    },
  },
};

const stepVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 35,
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

export default function HowItWorks() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="how-it-works"
        className="bg-shadow-grey text-brand-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">

            {/* ==================================================
                INTRO
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
                className="text-md font-semibold leading-none"
              >
                Process
              </motion.span>

              {/* Heading */}
              <motion.h2
                variants={contentItemVariants}
                className="mt-4 max-w-md text-4xl leading-[0.98] font-bold tracking-[-0.04em] sm:text-5xl lg:text-[clamp(3rem,4.2vw,4.25rem)]"
              >
                From idea to
                <br />
                print in four
                <br />
                steps.
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={contentItemVariants}
                className="mt-5 max-w-sm text-sm leading-[1.2] font-light tracking-[0.05em] text-white/75 md:text-lg"
              >
                We keep it simple. You share the idea, we handle the craft.
                No noise, no confusion, just a clear path from your brand to
                the physical object.
              </motion.p>

              {/* Actions */}
              <motion.div
                variants={contentItemVariants}
                className="mt-5 flex items-center gap-2"
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
                  <a
                  href={process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    className:
                      "h-8 rounded-none border border-white/60 bg-transparent px-4 text-[14px] font-medium text-brand-white hover:bg-brand-white hover:text-shadow-grey",
                  })}
                >
                  WhatsApp
                </a>
                </motion.div>

                <motion.div
                  whileHover={{ x: 2 }}
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
                    className="group flex h-8 items-center gap-1 px-1 text-[14px] font-medium text-white/80 hover:text-brand-white"
                  >
                    Instagram

                    <ArrowRight
                      size={13}
                      strokeWidth={1.5}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ==================================================
                STEPS
            ================================================== */}

            <motion.div
              variants={stepsContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
              }}
              className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-14"
            >
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.number}
                    variants={stepVariants}
                    whileHover={{ y: -4 }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 28,
                    }}
                    className="group"
                  >
                    {/* Optional icon */}
                    {/*
                    <div className="mb-5">
                      <Icon
                        size={20}
                        strokeWidth={1.4}
                        aria-hidden="true"
                      />
                    </div>
                    */}

                    <div className="flex items-start gap-3">
                      {/* Step number */}
                      <span className="pt-1 text-[14px] font-semibold text-white/60">
                        {step.number}
                      </span>

                      <div>
                        {/* Step title */}
                        <h3 className="max-w-[220px] text-xl leading-[1.02] font-semibold tracking-[-0.03em] sm:text-2xl">
                          {step.title}
                        </h3>

                        {/* Step description */}
                        <p className="mt-4 max-w-[230px] text-sm leading-[1.2] font-light tracking-[0.05em] text-white/70 md:text-lg">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </div>
      </section>
    </MotionConfig>
  );
}