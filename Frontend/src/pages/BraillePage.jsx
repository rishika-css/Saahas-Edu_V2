import BrailleTrainer from '../components/braille/BrailleTrainer';
import Navbar from '../components/common/Navbar';

export default function BraillePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <BrailleTrainer />
      </div>
    </div>
  );
}