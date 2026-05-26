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
      position: 'top-[20%] left-[20%]',
      image: '/assets/asteroid.png'
    },
    {
      id: 'level-2',
      title: 'Mission 2: Fraction Discovery',
      status: 'unlocked',
      description: 'Analyze alien artifacts to learn about parts of a whole.',
      position: 'top-[50%] left-[50%]',
      image: '/assets/alien-guide.png'
    },
    {
      id: 'level-3',
      title: 'Mission 3: Advanced Fractions',
      status: 'locked',
      description: 'Mix volatile fuels using fraction addition and subtraction.',
      position: 'top-[30%] left-[80%]',
      image: '/assets/bg-space-station.png'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen p-8 flex flex-col items-center relative"
    >
      <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8 z-10">
        Galaxy Math Explorer
      </h1>
      <p className="text-xl text-blue-200 mb-12 text-center max-w-2xl z-10">
        Choose your next mission to save the galaxy using the power of mathematics!
      </p>

      {/* Universe Map Container */}
      <div className="relative w-full max-w-5xl h-[600px] border-4 border-blue-900/50 rounded-3xl bg-black/40 backdrop-blur-sm overflow-hidden p-4">
        {/* Placeholder map background */}
        <div className="absolute inset-0 bg-[url('/assets/bg-star-map.png')] bg-cover opacity-60"></div>

        {/* Connection Lines Placeholder */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" preserveAspectRatio="none">
           <path d="M200 120 L500 300 L800 180" stroke="#3b82f6" strokeWidth="4" strokeDasharray="10 10" fill="none" />
        </svg>

        {levels.map((level, idx) => (
          <motion.button
            key={level.id}
            whileHover={{ scale: level.status === 'unlocked' ? 1.05 : 1 }}
            whileTap={{ scale: level.status === 'unlocked' ? 0.95 : 1 }}
            onClick={() => level.status === 'unlocked' && onSelectLevel(level.id)}
            className={`absolute flex flex-col items-center gap-3 ${level.position} transform -translate-x-1/2 -translate-y-1/2 group`}
            disabled={level.status === 'locked'}
          >
            <div className={`relative rounded-full p-2 ${level.status === 'locked' ? 'bg-gray-800' : 'bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.5)]'}`}>
              <img
                src={level.image}
                alt={level.title}
                className={`w-24 h-24 rounded-full border-4 ${level.status === 'locked' ? 'border-gray-600 grayscale' : 'border-blue-400'}`}
              />
              <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-2 border-2 border-slate-700">
                {level.status === 'locked' ? <Lock size={20} className="text-gray-400" /> : <Rocket size={20} className="text-blue-400" />}
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-4 w-64 pointer-events-none z-20">
              <h3 className="font-bold text-lg text-white mb-1">{level.title}</h3>
              <p className="text-sm text-slate-300">{level.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
