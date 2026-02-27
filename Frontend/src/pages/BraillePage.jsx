import BrailleTrainer from '../components/braille/BrailleTrainer';
import Navbar from '../components/common/Navbar';

export default function BraillePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <BrailleTrainer />
      </div>
    </div>
  );
}
