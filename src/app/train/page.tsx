import Navbar from "@/components/Navbar";
import TrainDashboard from "@/components/train/TrainDashboard";

export default function TrainPage() {
  return (
    <div className="h-screen bg-parchment p-4 md:p-6">
      <div className="h-full border-[3px] border-celadon rounded-2xl overflow-hidden bg-parchment flex flex-col">
        <Navbar />
        <TrainDashboard />
      </div>
    </div>
  );
}
