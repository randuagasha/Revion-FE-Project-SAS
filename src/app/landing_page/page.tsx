import { CTASection } from "./components/CTASection";
import { FeaturesSection } from "./components/featuresSection";
import { Footer } from "./components/footer";
import { HeroSection } from "./components/heroSection";
import Navbar from "./components/navbar";
import { ShowcaseSection } from "./components/showcaseSection";
import { StatsSection } from "./components/statsSection";
import { WhyRevionSection } from "./components/whyRevionSection";

export default function LandingPage() {
    return (
        <main>
            <Navbar></Navbar>
            <HeroSection></HeroSection>
            <StatsSection></StatsSection>
            <FeaturesSection></FeaturesSection>
            <WhyRevionSection></WhyRevionSection>
            <ShowcaseSection></ShowcaseSection>
            <CTASection></CTASection>
            <Footer></Footer>
        </main>
    )
}