import { Nav } from "@/components/nav/nav";
import { Hero } from "@/components/landing/hero";
import { ProductLoop } from "@/components/landing/product-loop";
import { SamenModus } from "@/components/landing/samen-modus";
import { RewardLoop } from "@/components/landing/reward-loop";
import { ProgressChartCard } from "@/components/landing/progress-chart-card";
import { Subjects } from "@/components/landing/subjects";
import { SeoProof } from "@/components/landing/seo-proof";
import { Trust } from "@/components/landing/trust";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <ProductLoop />
        <SamenModus />
        <RewardLoop />
        <ProgressChartCard />
        <Subjects />
        <SeoProof />
        <Trust />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
