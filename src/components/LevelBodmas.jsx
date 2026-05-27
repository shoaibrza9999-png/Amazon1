import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function LevelBodmas({ onBack }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const problem = "12 + 4 × (6 - 2) ÷ 2";
  const correctAnswer = 20;
  const options = [16, 20, 32, 28];

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen p-4 md:p-6 flex flex-col overflow-x-hidden"
    >
      <header className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors bg-slate-800/50 p-2 rounded-lg">
          <ArrowLeft size={24} />
          <span className="font-semibold">Abort Mission</span>
        </button>
        <div className="bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
          <span className="text-yellow-400 font-bold">Score: 0</span>
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
        {/* Visual Context Area */}
        <div className="relative rounded-2xl overflow-hidden border-4 border-slate-700 bg-slate-800 aspect-square md:aspect-auto md:h-[500px]">
          <div className="absolute inset-0 bg-[url('/assets/bg-cockpit-asteroid.png')] bg-cover bg-center"></div>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-6">
             <p className="text-lg text-blue-200">
               "Commander! We need to calculate the exact coordinate sequence to fire the lasers. Solve the equation!"
             </p>
          </div>
        </div>

        {/* Math Problem Area */}
        <div className="bg-slate-800/90 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-slate-700 backdrop-blur-md flex flex-col items-center">
          <h2 className="text-2xl font-bold text-slate-300 mb-2">Target Coordinates</h2>
          <div className="bg-slate-900 w-full py-4 md:py-8 rounded-xl md:rounded-2xl border-2 border-blue-900/50 shadow-inner mb-8 flex justify-center items-center">
            <span className="text-2xl md:text-5xl font-mono text-blue-400 tracking-wider">
              {problem}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            {options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !showFeedback && handleAnswer(opt)}
                className={`
                  py-4 md:py-6 rounded-xl text-xl md:text-2xl font-bold border-2 transition-colors
                  ${showFeedback && opt === correctAnswer
                    ? 'bg-green-600/20 border-green-500 text-green-400'
                    : showFeedback && opt === selectedAnswer && opt !== correctAnswer
                    ? 'bg-red-600/20 border-red-500 text-red-400'
                    : 'bg-slate-700/50 border-slate-600 hover:border-blue-400 text-white'}
                `}
                disabled={showFeedback}
              >
                {opt}
              </motion.button>
            ))}
          </div>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-8 p-4 rounded-xl w-full flex items-center justify-center gap-3 border ${selectedAnswer === correctAnswer ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500'}`}
            >
              {selectedAnswer === correctAnswer ? (
                <>
                  <CheckCircle className="text-green-400" />
                  <span className="text-green-100 font-semibold">Target locked! Asteroid destroyed!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-400" />
                  <span className="text-red-100 font-semibold">Missed! Remember BODMAS: Brackets first!</span>
                </>
              )}
            </motion.div>
          )}

          {showFeedback && (
             <button className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-colors">
               Next Target
             </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
