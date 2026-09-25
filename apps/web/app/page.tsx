import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import HowItWorks from "../components/home/HowItWorks";
import Stats from "../components/home/Stats";
import CTA from "../components/home/CTA";
import Footer from "../components/home/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white dark:bg-[#050b18]">
      <Navbar />

      <Hero />

      <Stats />

      <Features />

      <HowItWorks />

      <CTA />

      <Footer />
    </main>
  );
}
