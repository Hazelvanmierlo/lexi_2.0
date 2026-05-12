import { Nav } from "@/components/nav/nav";
import { Footer } from "@/components/landing/footer";
import { BenefitsPanel } from "@/components/signup/benefits-panel";
import { SignupWizard } from "@/components/signup/signup-wizard";

export default function SignupPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-bg-2 px-5 py-12 md:py-20">
        <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-[1fr_1.4fr]">
          <BenefitsPanel />
          <SignupWizard />
        </div>
      </main>
      <Footer />
    </>
  );
}
