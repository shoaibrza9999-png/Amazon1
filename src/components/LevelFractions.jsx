import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Zap } from 'lucide-react';

export default function LevelFractions({ onBack, type }) {
  const [selectedParts, setSelectedParts] = useState([]);

  const totalParts = 4;
  const targetFraction = "3/4";

  const togglePart = (index) => {
    if (selectedParts.includes(index)) {
      setSelectedParts(selectedParts.filter(i => i !== index));
    } else {
      setSelectedParts([...selectedParts, index]);
    }
  };

  const isComplete = selectedParts.length === 3;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="min-h-screen p-6 flex flex-col"
    >
      <header className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors bg-slate-800/50 p-2 rounded-lg">
          <ArrowLeft size={24} />
          <span className="font-semibold">Return to Ship</span>
        </button>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Story/Task Panel */}
        <div className="bg-slate-800/80 p-8 rounded-3xl border border-purple-900/50 backdrop-blur-sm order-2 lg:order-1">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <Zap className="text-purple-400" />
            Energy Cell Charging
          </h2>
          <p className="text-xl text-purple-200 mb-8 leading-relaxed">
            {type === 'intro'
              ? "The alien artifact requires exactly "
              : "To balance the ship's thrusters, add the required fuel: "}
            <span className="text-white font-bold bg-purple-900/50 px-3 py-1 rounded-lg border border-purple-500 mx-2">
              {targetFraction}
            </span>
            of its total capacity. Tap the segments to fill them with plasma energy.
          </p>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
             <div className="flex justify-between items-end mb-2">
               <span className="text-slate-400">Current Charge</span>
               <span className="text-2xl font-bold text-purple-400">{selectedParts.length} / {totalParts}</span>
             </div>
             <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(selectedParts.length / totalParts) * 100}%` }}
                  transition={{ type: "spring", stiffness: 50 }}
                />
             </div>
          </div>

          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-green-900/30 border border-green-500/50 rounded-xl flex items-center gap-4"
              >
                <CheckCircle className="text-green-400 w-8 h-8 flex-shrink-0" />
                <p className="text-green-200">System balanced! Power restored to optimal levels.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isComplete && (
             <motion.button
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="mt-6 w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
             >
               Initialize Next Cell
             </motion.button>
          )}
        </div>

        {/* Interactive Visual Area */}
        <div className="relative aspect-square w-full max-w-md mx-auto order-1 lg:order-2">
           {/* Background Context */}
           <div className="absolute inset-0 rounded-full bg-[url('/assets/bg-energy-core.png')] bg-cover opacity-30 animate-pulse-slow mix-blend-screen"></div>

           {/* Interactive Fraction Circle */}
           <div className="absolute inset-4 rounded-full border-8 border-slate-800 overflow-hidden bg-slate-900 shadow-2xl relative">
              {/* This SVG creates the slices of the pie chart */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {[0, 1, 2, 3].map((index) => {
                  const isActive = selectedParts.includes(index);
                  // Quick math for 4 slices
                  const dashArray = `${25} ${100 - 25}`;
                  const offset = - (index * 25);

                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="25"
                      fill="transparent"
                      stroke={isActive ? "#d946ef" : "#1e293b"}
                      strokeWidth="50"
                      strokeDasharray={dashArray}
                      strokeDashoffset={offset}
                      className="transition-all duration-300 cursor-pointer hover:opacity-80"
                      onClick={() => togglePart(index)}
                    />
                  );
                })}
              </svg>

              {/* Center cutout to make it look like a sci-fi reactor core */}
              <div className="absolute inset-1/4 bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center shadow-inner">
                <div className={`w-1/2 h-1/2 rounded-full blur-md transition-all duration-500 ${isComplete ? 'bg-green-500/50' : 'bg-purple-500/20'}`}></div>
              </div>
           </div>
        </div>

      </div>
    </motion.div>
  );
}

// Ensure AnimatePresence is available here too by re-exporting or importing correctly
import { AnimatePresence as FramerAnimatePresence } from 'framer-motion';
const AnimatePresence = FramerAnimatePresence;
