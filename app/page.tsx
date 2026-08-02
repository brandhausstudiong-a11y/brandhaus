// app/page.tsx

import Link from "next/link";
import { MessageCircle, Music2, ArrowRight } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-950 text-stone-100">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />

        <div className="absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-stone-500/10 blur-[180px]" />

        <div className="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-stone-300/5 blur-[180px]" />

        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:80px_80px]" />
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center">
        {/* Brand */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-400">
            Brandhaus Studio
          </p>

          <div className="mx-auto mt-5 h-px w-20 bg-stone-700" />
        </div>

        {/* Heading */}
        <h1 className="mt-12 max-w-5xl text-5xl font-light leading-tight tracking-tight md:text-7xl lg:text-8xl">
          Building the Home of
          <span className="mt-3 block font-semibold text-white">
            Premium Product Branding.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-10 max-w-3xl text-lg leading-8 text-stone-300 md:text-xl">
          Brandhaus Studio helps businesses create unforgettable first
          impressions through premium stickers, labels, and packaging designed
          to elevate every product.
        </p>

        <p className="mt-5 max-w-xl text-stone-500">
          Our new website is almost ready. In the meantime, we'd love to hear
          about your next project.
        </p>

        {/* CTA */}
        <Link
          href="https://wa.me/2347048000567"
          target="_blank"
          className="group mt-14 inline-flex items-center gap-3 rounded-full border border-stone-700 bg-stone-100 px-8 py-4 text-sm font-semibold text-stone-900 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-stone-800/40"
        >
          <MessageCircle className="h-5 w-5" />

          Start a Conversation

          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Social Cards */}
        <div className="mt-20 grid w-full max-w-3xl gap-5 md:grid-cols-3">
          {/* WhatsApp */}
          <Link
            href="https://wa.me/2347048000567"
            target="_blank"
            className="group rounded-3xl border border-stone-800 bg-stone-900/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-stone-600 hover:bg-stone-900"
          >
            <MessageCircle className="mx-auto h-8 w-8 text-stone-300 transition group-hover:text-white" />

            <h3 className="mt-5 text-lg font-semibold">
              WhatsApp
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Get a quotation or discuss your branding project.
            </p>
          </Link>

          {/* Instagram */}
          <Link
            href="https://instagram.com/brandhauzstudio"
            target="_blank"
            className="group rounded-3xl border border-stone-800 bg-stone-900/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-stone-600 hover:bg-stone-900"
          >
            {/* <Instagram className="mx-auto h-8 w-8 text-stone-300 transition group-hover:text-white" /> */}

            <h3 className="mt-5 text-lg font-semibold">
              Instagram
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Discover our latest branding and packaging projects.
            </p>
          </Link>

          {/* TikTok */}
          <Link
            href="https://tiktok.com/@brandhauzstudio"
            target="_blank"
            className="group rounded-3xl border border-stone-800 bg-stone-900/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-stone-600 hover:bg-stone-900"
          >
            <Music2 className="mx-auto h-8 w-8 text-stone-300 transition group-hover:text-white" />

            <h3 className="mt-5 text-lg font-semibold">
              TikTok
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Behind the scenes, print tips, and brand inspiration.
            </p>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-24">
          <div className="mx-auto mb-6 h-px w-24 bg-stone-800" />

          <p className="text-sm tracking-wide text-stone-500">
            Premium Stickers • Product Labels • Packaging • Brand Identity
          </p>

          <p className="mt-3 text-xs uppercase tracking-[0.35em] text-stone-600">
            Where Great Brands Come to Life
          </p>
        </div>
      </section>
    </main>
  );
}