// app/page.tsx
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
  );
}