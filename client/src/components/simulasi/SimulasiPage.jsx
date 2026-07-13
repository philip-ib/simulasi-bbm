import FuelForm from "./FuelForm.jsx";
import TankVisual from "./TankVisual.jsx";
import ResultDisplay from "./ResultDisplay.jsx";

export default function SimulasiPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FuelForm />
      <div className="bg-white rounded-xl shadow-md border-t-4 border-red-600 p-6 flex flex-col items-center">
        <TankVisual />
        <ResultDisplay />
      </div>
    </div>
  );
}
