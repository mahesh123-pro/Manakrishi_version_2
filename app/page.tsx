import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { CropsStrip } from "@/components/sections/CropsStrip";
import { About } from "@/components/sections/About";
import { WhyDrone } from "@/components/sections/WhyDrone";
import { Comparison } from "@/components/sections/Comparison";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { DroneTech } from "@/components/sections/DroneTech";
import { PrecisionFarming } from "@/components/sections/PrecisionFarming";
import { Services } from "@/components/sections/Services";
import { SupportSchemes } from "@/components/sections/SupportSchemes";
import { Benefits } from "@/components/sections/Benefits";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { BookingShowcase } from "@/components/sections/BookingShowcase";
import { IndiaMap } from "@/components/sections/IndiaMap";
import { Testimonials } from "@/components/sections/Testimonials";
import { Roadmap } from "@/components/sections/Roadmap";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <CropsStrip />
      <About />
      <WhyDrone />
      <Comparison />
      <HowItWorks />
      <DroneTech />
      <PrecisionFarming />
      <Services />
      <SupportSchemes />
      <Benefits />
      <DashboardPreview />
      <BookingShowcase />
      <IndiaMap />
      <Testimonials />
      <Roadmap />
      <Faq />
      <Contact />
    </>
  );
}
