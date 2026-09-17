// app/page.tsx

import Link from "next/link";
import { MessageCircle, Music2, ArrowRight } from "lucide-react";
import Hero from "@/components/homepage/Hero";
import WhatWeDo from "@/components/homepage/WhatWeDo";
import BrandDifference from "@/components/homepage/BrandDifference";
import StartProject from "@/components/homepage/StartProject";
import Industries from "@/components/homepage/Industries";
import HowItWorks from "@/components/homepage/HowItWorks";

export default function ComingSoonPage() {
  return (
    <main>
      <Hero />
      <WhatWeDo />
      <BrandDifference />
      <HowItWorks />
      <Industries />
      <StartProject />
    </main>
    // <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-950 text-stone-100">

    //     <Link
    //       href="https://wa.me/2347048000567"
    //       target="_blank"
    //       className="group mt-14 inline-flex items-center gap-3 rounded-full border border-stone-700 bg-stone-100 px-8 py-4 text-sm font-semibold text-stone-900 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-stone-800/40"
    //     >
    //       <MessageCircle className="h-5 w-5" />

    //       Start a Conversation

    //       <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    //     </Link>
    //       <Link
    //         href="https://wa.me/2347048000567"
    //         target="_blank"
    //         className="group rounded-3xl border border-stone-800 bg-stone-900/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-stone-600 hover:bg-stone-900"
    //       > quotation or discuss your branding project.
    //       </Link>
    //       <Link
    //         href="https://instagram.com/brandhauzstudio"
    //         target="_blank"
    //         className="group rounded-3xl border border-stone-800 bg-stone-900/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-stone-600 hover:bg-stone-900"
    //       >
    //       </Link>
    //       <Link
    //         href="https://tiktok.com/@brandhauzstudio"
    //         target="_blank"
    //         className="group rounded-3xl border border-stone-800 bg-stone-900/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-stone-600 hover:bg-stone-900"
    //       >
    //       </Link>

    // </main>
  );
}