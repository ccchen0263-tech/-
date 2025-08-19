import React, { useState } from 'react';
import { WORD_CARDS, PICTURE_CARD_PROMPTS } from '../constants';

interface SelectionScreenProps {
  onDraw: (pictureCardNumber: number, wordCardNumber: number) => void;
  error: string | null;
}

type SelectionMode = 'random' | 'specify';

export function SelectionScreen({ onDraw, error }: SelectionScreenProps): React.ReactNode {
  const [mode, setMode] = useState<SelectionMode>('random');
  const [pictureNumber, setPictureNumber] = useState('');
  const [wordNumber, setWordNumber] = useState('');
  const [formError, setFormError] = useState('');

  const handleDraw = () => {
    setFormError('');
    if (mode === 'random') {
      const randomPicture = Math.floor(Math.random() * PICTURE_CARD_PROMPTS.length) + 1;
      const randomWord = Math.floor(Math.random() * WORD_CARDS.length) + 1;
      onDraw(randomPicture, randomWord);
    } else {
      const picNum = parseInt(pictureNumber, 10);
      const wordNum = parseInt(wordNumber, 10);
      if (isNaN(picNum) || isNaN(wordNum) || picNum < 1 || picNum > 88 || wordNum < 1 || wordNum > 88) {
        setFormError('請輸入 1 到 88 之間的有效數字。');
        return;
      }
      onDraw(picNum, wordNum);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">選擇您的卡牌</h2>
      
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <div className="flex justify-center mb-6 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
        <button 
          onClick={() => setMode('random')}
          className={`w-1/2 py-2 rounded-md transition-colors ${mode === 'random' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          隨機抽取
        </button>
        <button 
          onClick={() => setMode('specify')}
          className={`w-1/2 py-2 rounded-md transition-colors ${mode === 'specify' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          指定號碼
        </button>
      </div>

      {mode === 'specify' && (
        <div className="space-y-4 mb-6 animate-fade-in-slow">
          <div>
            <label htmlFor="picture-number" className="block text-sm font-medium text-slate-700 dark:text-slate-300">圖卡 (1-88)</label>
            <input
              type="number"
              id="picture-number"
              value={pictureNumber}
              onChange={(e) => setPictureNumber(e.target.value)}
              min="1"
              max="88"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="word-number" className="block text-sm font-medium text-slate-700 dark:text-slate-300">字卡 (1-88)</label>
            <input
              type="number"
              id="word-number"
              value={wordNumber}
              onChange={(e) => setWordNumber(e.target.value)}
              min="1"
              max="88"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}
      
      {formError && <p className="text-red-500 text-center mb-4">{formError}</p>}

      <button
        onClick={handleDraw}
        className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
      >
        抽牌
      </button>
    </div>
  );
}