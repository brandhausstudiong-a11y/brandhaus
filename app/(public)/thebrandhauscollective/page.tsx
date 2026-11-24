
"use client";

import {
  ArrowUpRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import {
  motion,
  MotionConfig,
  type Variants,
} from "motion/react";

import { buttonVariants } from "@/components/ui/button";

const details = [
  "Business name",
  "Business location",
  "Contact person",
  "Phone number",
  "Instagram handle",
  "Type of products you sell",
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
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

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.09,
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
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function BrandhausCollectivePage() {
  const whatsappMessage = [
    "Hello Brandhaus Studio!",
    "",
    "I'm interested in collaborating for The Brandhaus Collective.",
    "",
    "Here are my business details:",
    ...details.map((detail) => `${detail}:`),
  ].join("\n");

  const whatsappUrl = `${
    process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "#"
  }`;

  const contactUrl =
    whatsappUrl !== "#"
      ? `${whatsappUrl}${whatsappUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(
          whatsappMessage
        )}`
      : "#";

  return (
    <MotionConfig reducedMotion="user">
      <main className="overflow-hidden">

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="bg-shadow-grey text-brand-white">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-10 lg:py-36">

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-5xl"
            >
              <motion.div
                variants={itemVariants}
                className="mb-8 flex items-center gap-3"
              >
                <span className="h-2 w-2 rounded-full bg-tiger-flame" />
                <span className="text-sm font-semibold tracking-wide">
                  A BRAND COLLABORATION EXPERIENCE
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="max-w-5xl text-5xl leading-[0.92] font-bold tracking-[-0.055em] sm:text-7xl lg:text-[clamp(5rem,10vw,9rem)]"
              >
                THE
                <br />
                BRANDHAUS
                <br />
                <span className="text-tiger-flame">
                  COLLECTIVE.
                </span>
              </motion.h1>

              <motion.div
                variants={itemVariants}
                className="mt-10 flex flex-col justify-between gap-8 border-t border-white/20 pt-6 sm:flex-row sm:items-end"
              >
                <p className="max-w-md text-lg leading-snug font-light tracking-wide text-white/75 sm:text-xl">
                  Where Brands Connect, Create, and grow together.
                </p>

                <span className="text-sm font-medium tracking-wide text-white/50">
                  ORGANised BY BRANDHAUS STUDIO
                </span>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* ==================================================
            INTRODUCTION
        ================================================== */}

        <section className="bg-parchment text-shadow-grey">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
              >
                <motion.span
                  variants={itemVariants}
                  className="text-sm font-semibold tracking-tight"
                >
                  AN OPEN INVITATION
                </motion.span>

                <motion.h2
                  variants={itemVariants}
                  className="mt-5 max-w-md text-4xl leading-[0.98] font-bold tracking-[-0.045em] sm:text-5xl lg:text-6xl"
                >
                  LET'S CREATE
                  <br />
                  SOMETHING
                  <br />
                  TOGETHER!
                </motion.h2>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                className="max-w-2xl lg:pt-10"
              >
                <motion.p
                  variants={itemVariants}
                  className="text-lg leading-relaxed font-light tracking-wide sm:text-xl"
                >
                  We’re bringing together a select group of exciting
                  businesses for a unique brand collaboration experience.
                </motion.p>

                <motion.p
                  variants={itemVariants}
                  className="mt-6 text-base leading-relaxed font-light tracking-wide text-shadow-grey/75 sm:text-lg"
                >
                  A space to connect, showcase your products, exchange
                  ideas, create engaging content, and explore creative
                  opportunities together.
                </motion.p>

                <motion.p
                  variants={itemVariants}
                  className="mt-6 text-base leading-relaxed font-light tracking-wide text-shadow-grey/75 sm:text-lg"
                >
                  If you’re a business owner with a passion for great
                  products and brand storytelling, we’d love to have you
                  as one of our collaborating brands.
                </motion.p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ==================================================
            COLLABORATION MESSAGE
        ================================================== */}

        <section className="bg-shadow-grey text-brand-white">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <motion.div
                  variants={itemVariants}
                  className="mb-5 flex items-center gap-2 text-tiger-flame"
                >
                  <Sparkles size={17} strokeWidth={1.5} />
                  <span className="text-sm font-semibold">
                    THE IDEA
                  </span>
                </motion.div>

                <motion.h2
                  variants={itemVariants}
                  className="max-w-3xl text-4xl leading-[0.98] font-bold tracking-[-0.045em] sm:text-5xl lg:text-7xl"
                >
                  Let’s connect,
                  <br />
                  create, and grow
                  <br />
                  <span className="text-tiger-flame">together.</span>
                </motion.h2>
              </div>

              <motion.p
                variants={itemVariants}
                className="max-w-xs text-sm leading-relaxed font-light tracking-wide text-white/65 sm:text-base"
              >
                Great brands are built through creativity, meaningful
                connections, and shared experiences.
              </motion.p>
            </motion.div>

          </div>
        </section>

        {/* ==================================================
            COLLABORATION DETAILS
        ================================================== */}

        <section className="bg-parchment text-shadow-grey">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

              {/* INTRO */}

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
              >
                <motion.span
                  variants={itemVariants}
                  className="text-sm font-semibold"
                >
                  JOIN THE COLLECTIVE
                </motion.span>

                <motion.h2
                  variants={itemVariants}
                  className="mt-5 max-w-sm text-4xl leading-[0.98] font-bold tracking-[-0.045em] sm:text-5xl"
                >
                  Interested in collaborating?
                </motion.h2>

                <motion.p
                  variants={itemVariants}
                  className="mt-5 max-w-sm text-sm leading-relaxed font-light tracking-wide text-shadow-grey/70 sm:text-base"
                >
                  We’d love to learn more about your business. Send us
                  the following information on WhatsApp to express
                  your interest.
                </motion.p>
              </motion.div>

              {/* DETAILS LIST */}

              <motion.div
                variants={listVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="border-b border-shadow-grey/60"
              >
                {details.map((detail, index) => (
                  <motion.div
                    key={detail}
                    variants={rowVariants}
                    className="flex items-center gap-5 border-t border-shadow-grey/60 py-5 sm:py-6"
                  >
                    <span className="w-8 shrink-0 text-xs font-semibold text-shadow-grey/50">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="text-lg font-semibold tracking-tight sm:text-xl">
                      {detail}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

            </div>

            {/* WHATSAPP CTA */}

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mt-16 flex flex-col gap-5 border-t border-shadow-grey/20 pt-8 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xl font-semibold tracking-tight">
                  Ready to be part of it?
                </p>
                <p className="mt-2 text-sm font-light text-shadow-grey/65">
                  Send us a message and let’s start a conversation.
                </p>
              </div>

              <motion.a
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                href={contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  className:
                    "h-11 w-fit rounded-none bg-tiger-flame px-6 text-sm font-medium text-brand-white hover:bg-tiger-flame/90",
                })}
              >
                <MessageCircle size={16} />
                WhatsApp Us
                <ArrowUpRight size={16} />
              </motion.a>
            </motion.div>

          </div>
        </section>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="bg-shadow-grey text-brand-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">

            <p className="text-sm font-semibold tracking-wide">
              THE BRANDHAUS COLLECTIVE
            </p>

            <p className="text-xs font-light tracking-wide text-white/55">
              Organised by Brandhaus Studio
            </p>

          </div>
        </footer>

      </main>
    </MotionConfig>
  );
}
