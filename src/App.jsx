import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Map, Rocket, CheckCircle, XCircle } from 'lucide-react';

// Components
import LevelSelect from './components/LevelSelect';
import LevelBodmas from './components/LevelBodmas';
import LevelFractions from './components/LevelFractions';

function App() {
  const [currentScreen, setCurrentScreen] = useState('map');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'map':
        return <LevelSelect onSelectLevel={setCurrentScreen} />;
      case 'level-1':
        return <LevelBodmas onBack={() => setCurrentScreen('map')} />;
      case 'level-2':
        return <LevelFractions onBack={() => setCurrentScreen('map')} type="intro" />;
      case 'level-3':
        return <LevelFractions onBack={() => setCurrentScreen('map')} type="ops" />;
      default:
        return <LevelSelect onSelectLevel={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden relative">
      {/* Background Starfield Placeholder */}
      <div className="absolute inset-0 z-0 bg-[url('/assets/bg-space-station.png')] bg-cover bg-center opacity-50" />

      <main className="relative z-10 w-full h-screen overflow-y-auto">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
