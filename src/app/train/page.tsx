import Navbar from "@/components/Navbar";
import TrainDashboard from "@/components/train/TrainDashboard";

export default function TrainPage() {
  return (
    <div className="h-screen bg-parchment flex flex-col">
      <Navbar />
      <TrainDashboard />
    </div>
  );
}
