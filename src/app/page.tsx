import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import ComparisonSection from "@/components/ComparisonSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-parchment p-4 md:p-6">
      <div className="border-[3px] border-celadon rounded-2xl overflow-hidden bg-parchment min-h-[calc(100vh-3rem)]">
        <Navbar />
        <main>
          <HeroSection />
          <ProblemSection />
          <ComparisonSection />
        </main>
      </div>
    </div>
  );
}
