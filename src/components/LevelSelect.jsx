import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Rocket } from 'lucide-react';

export default function LevelSelect({ onSelectLevel }) {
  const levels = [
    {
      id: 'level-1',
      title: 'Mission 1: BODMAS Basics',
      status: 'unlocked',
      description: 'Navigate the asteroid field using order of operations.',
      position: 'md:top-[20%] md:left-[20%]',
      image: '/assets/asteroid.png'
    },
    {
      id: 'level-2',
      title: 'Mission 2: Fraction Discovery',
      status: 'unlocked',
      description: 'Analyze alien artifacts to learn about parts of a whole.',
      position: 'md:top-[50%] md:left-[50%]',
      image: '/assets/alien-guide.png'
    },
    {
      id: 'level-3',
      title: 'Mission 3: Advanced Fractions',
      status: 'locked',
      description: 'Mix volatile fuels using fraction addition and subtraction.',
      position: 'md:top-[30%] md:left-[80%]',
      image: '/assets/bg-space-station.png'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen p-4 md:p-8 flex flex-col items-center relative"
    >
      <h1 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 md:mb-8 z-10 text-center">
        Galaxy Math Explorer
      </h1>
      <p className="text-lg md:text-xl text-blue-200 mb-8 md:mb-12 text-center max-w-2xl z-10 px-4">
        Choose your next mission to save the galaxy using the power of mathematics!
      </p>

      {/* Mobile: Vertical List | Desktop: Universe Map */}
      <div className="relative w-full max-w-5xl md:h-[600px] border-2 md:border-4 border-blue-900/50 rounded-3xl bg-black/40 backdrop-blur-sm overflow-hidden p-4 flex flex-col md:block gap-4">
        {/* Map background (Desktop only) */}
        <div className="hidden md:block absolute inset-0 bg-[url('/assets/bg-star-map.png')] bg-cover opacity-60"></div>

        {/* Connection Lines (Desktop only) */}
        <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none opacity-50" preserveAspectRatio="none">
           <path d="M200 120 L500 300 L800 180" stroke="#3b82f6" strokeWidth="4" strokeDasharray="10 10" fill="none" />
        </svg>

        {levels.map((level, idx) => (
          <motion.button
            key={level.id}
            whileHover={{ scale: level.status === 'unlocked' ? 1.02 : 1 }}
            whileTap={{ scale: level.status === 'unlocked' ? 0.98 : 1 }}
            onClick={() => level.status === 'unlocked' && onSelectLevel(level.id)}
            className={`
              /* Mobile Styles */
              relative w-full flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700
              /* Desktop Styles */
              md:absolute md:flex-col md:bg-transparent md:border-0 md:p-0 md:w-auto md:-translate-x-1/2 md:-translate-y-1/2
              ${level.position} group
            `}
            disabled={level.status === 'locked'}
          >
            <div className={`relative shrink-0 rounded-full p-2 md:p-2 ${level.status === 'locked' ? 'bg-gray-800' : 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] md:shadow-[0_0_30px_rgba(37,99,235,0.5)]'}`}>
              <img
                src={level.image}
                alt={level.title}
                className={`w-16 h-16 md:w-24 md:h-24 rounded-full border-2 md:border-4 object-cover ${level.status === 'locked' ? 'border-gray-600 grayscale' : 'border-blue-400'}`}
              />
              <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-slate-900 rounded-full p-1.5 md:p-2 border border-slate-700 md:border-2">
                {level.status === 'locked' ? <Lock size={16} className="text-gray-400 md:w-5 md:h-5" /> : <Rocket size={16} className="text-blue-400 md:w-5 md:h-5" />}
              </div>
            </div>

            {/* Mobile Text (Always visible) */}
            <div className="flex flex-col text-left md:hidden">
              <h3 className={`font-bold text-base mb-1 ${level.status === 'locked' ? 'text-gray-500' : 'text-white'}`}>{level.title}</h3>
              <p className={`text-xs ${level.status === 'locked' ? 'text-gray-600' : 'text-slate-300'}`}>{level.description}</p>
            </div>

            {/* Desktop Hover Card */}
            <div className="hidden md:block bg-slate-900/90 p-3 rounded-xl border border-slate-700 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-4 w-64 pointer-events-none z-20 shadow-xl">
              <h3 className="font-bold text-lg text-white mb-1">{level.title}</h3>
              <p className="text-sm text-slate-300">{level.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
