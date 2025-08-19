
import React, { useState, useEffect } from 'react';

interface BreathingScreenProps {
  onComplete: () => void;
}

const breathingCycles = 3;
const breathDuration = 5000; // 5 seconds for inhale, 5 for exhale
const holdDuration = 2000; // 2 seconds hold

export function BreathingScreen({ onComplete }: BreathingScreenProps): React.ReactNode {
  const [text, setText] = useState('請找一個安靜舒適的地方坐下...');
  const [cycle, setCycle] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const startJourney = () => {
        if (cycle < breathingCycles) {
            setText('吸氣...');
            setTimeout(() => {
                setText('保持...');
                setTimeout(() => {
                    setText('吐氣...');
                    setTimeout(() => {
                       setCycle(prev => prev + 1);
                    }, breathDuration)
                }, holdDuration)
            }, breathDuration)
        } else {
            setText('準備好了嗎？');
            setShowButton(true);
        }
    };
    
    if (cycle === 0) {
        // Initial delay before starting
        const initialTimer = setTimeout(() => {
            setCycle(1)
        }, 3000);
        return () => clearTimeout(initialTimer);
    } else {
        startJourney();
    }

  }, [cycle]);

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center flex flex-col items-center justify-center h-96 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">三次靜心呼吸準備</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8">讓我們透過幾次深呼吸，來沉澱心緒。</p>
        
        <div className="relative w-40 h-40 flex items-center justify-center">
            <div className={`absolute w-full h-full bg-indigo-200 dark:bg-indigo-500/30 rounded-full ${text === '吸氣...' ? 'animate-expand' : text === '吐氣...' ? 'animate-shrink' : ''}`}
                 style={{ animationDuration: `${breathDuration}ms` }}
            />
            <p className="text-2xl font-semibold text-indigo-800 dark:text-indigo-200 z-10">{text}</p>
        </div>

        {showButton && (
            <button
                onClick={onComplete}
                className="mt-12 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 animate-fade-in-slow"
            >
                繼續
            </button>
        )}
        <style>
            {`
            @keyframes expand {
                from { transform: scale(0.5); opacity: 0.7; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes shrink {
                from { transform: scale(1); opacity: 1; }
                to { transform: scale(0.5); opacity: 0.7; }
            }
            .animate-expand { animation: expand ease-in-out forwards; }
            .animate-shrink { animation: shrink ease-in-out forwards; }
            .animate-fade-in {
                animation: fadeIn 0.5s ease-in-out;
            }
            .animate-fade-in-slow {
                animation: fadeIn 1s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            `}
        </style>
    </div>
  );
}
