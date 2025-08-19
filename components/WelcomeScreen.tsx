import React from 'react';
import { CardIcon } from './icons';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps): React.ReactNode {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center animate-fade-in">
      <div className="flex justify-center items-center mb-6">
         <CardIcon className="w-16 h-16 text-indigo-500" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">歡迎來到天使牌卡指引</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        這是一個連結內在智慧與天使能量的空間。透過牌卡，您將接收到溫暖的支持與正向的提醒。
      </p>
      <div className="text-left bg-slate-100 dark:bg-slate-700 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">如何進行</h2>
        <p><strong className="text-indigo-500 dark:text-indigo-400">1. 靜心準備：</strong>旅程開始前，會有一個簡短的呼吸練習，幫助您放鬆並連結內在。</p>
        <p><strong className="text-indigo-500 dark:text-indigo-400">2. 接收牌卡：</strong>您將會收到一組由天使為您挑選的圖卡與字卡。</p>
        <p><strong className="text-indigo-500 dark:text-indigo-400">3. 感受訊息：</strong>請用心感受圖像與文字帶給您的共鳴與訊息，這份直覺就是天使的低語。</p>
        <p><strong className="text-indigo-500 dark:text-indigo-400">4. 敞開接納：</strong>請敞開心胸，接納所有訊息。這是一份來自宇宙的禮物，充滿了愛與智慧。</p>
      </div>
      <button
        onClick={onStart}
        className="mt-8 w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
      >
        開始
      </button>
    </div>
  );
}
