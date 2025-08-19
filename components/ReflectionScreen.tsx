import React, { useState, useRef, useEffect } from 'react';
import type { CardPair, ChatMessage } from '../types';
import { SendIcon, AngelIcon, ContinueIcon, ConclusionIcon, AddCardIcon, ExportIcon, RestartIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

interface ReflectionScreenProps {
  cards: CardPair[];
  activeCardIndex: number;
  onSetActiveCardIndex: (index: number) => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  onDrawAgain: () => void;
  onDrawAdditionalPair: () => void;
  isAiResponding: boolean;
  isSessionComplete: boolean;
  showConclusionOptions: boolean;
  onContinueAssociating: () => void;
  onGenerateConclusion: () => void;
  isAwaitingTopic: boolean;
  onFinalizeConclusion: (topic: string | null) => void;
  blessingImageUrl: string | null;
  higherSelfQuote: string | null;
  onExportConversation: () => void;
}

export function ReflectionScreen({ 
  cards,
  activeCardIndex,
  onSetActiveCardIndex,
  chatHistory, 
  onSendMessage, 
  onDrawAgain, 
  onDrawAdditionalPair,
  isAiResponding, 
  isSessionComplete,
  showConclusionOptions,
  onContinueAssociating,
  onGenerateConclusion,
  isAwaitingTopic,
  onFinalizeConclusion,
  blessingImageUrl,
  higherSelfQuote,
  onExportConversation
}: ReflectionScreenProps): React.ReactNode {
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const activeCard = cards[activeCardIndex];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiResponding]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }

  const handleFinalize = () => {
    onFinalizeConclusion(topic.trim() || null);
  }

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleFinalize();
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 p-4 h-[90vh]">
      {/* Left side: Cards + Draw Again button */}
      <div className={`lg:w-1/3 flex-col items-center gap-6 animate-fade-in ${isSessionComplete ? 'hidden lg:flex' : 'flex'}`}>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">天使的訊息</h2>
        <div className="flex flex-col gap-6 w-full items-center">
          {/* Active Picture Card */}
          <div className="w-full max-w-[250px] aspect-[3/4] bg-slate-200 dark:bg-slate-700 rounded-xl shadow-lg flex flex-col p-2">
            <img src={activeCard.picture.imageUrl} alt={activeCard.picture.prompt} className="w-full h-full object-cover rounded-lg" />
            <span className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">#{activeCard.picture.number}</span>
          </div>
          {/* Active Word Card */}
          <div className="w-full max-w-[250px] aspect-[3/4] bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col items-center justify-center p-4 relative">
            <span className="text-3xl font-semibold text-center text-slate-800 dark:text-slate-100">{activeCard.word.text}</span>
            <span className="text-center text-xs text-slate-500 dark:text-slate-400 absolute bottom-2">#{activeCard.word.number}</span>
          </div>
        </div>

        {/* Other Card Thumbnails */}
        {cards.length > 1 && (
            <div className="w-full max-w-[250px] mt-4">
                <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-2">已接收的訊息</p>
                <div className="flex justify-center gap-2">
                    {cards.map((card, index) => (
                        <button 
                            key={index}
                            onClick={() => onSetActiveCardIndex(index)}
                            className={`w-14 h-14 rounded-md p-1 border-2 transition-all ${index === activeCardIndex ? 'border-indigo-500 scale-110' : 'border-transparent hover:border-slate-400'}`}
                        >
                           <div className="w-full h-full bg-slate-300 dark:bg-slate-700 rounded-sm flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-200">#{index + 1}</span>
                           </div>
                        </button>
                    ))}
                </div>
            </div>
        )}
        
        {!isSessionComplete && (
            <button 
              onClick={onDrawAgain}
              className="mt-auto w-full max-w-[250px] bg-slate-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
            >
              重新開始
            </button>
        )}
      </div>

      {/* Right side: Chat */}
      <div className="lg:w-2/3 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg h-full">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {chatHistory.map((chat, index) => {
              if (chat.isSummary) {
                return (
                  <div key={index} className="flex justify-start">
                    <div className="w-full max-w-2xl p-4 rounded-lg bg-indigo-50 dark:bg-slate-700/50 border border-indigo-200 dark:border-slate-600">
                      <div className="flex items-center mb-2">
                        <AngelIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-300">天使的回饋</h3>
                      </div>
                      <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{chat.text.replace(/\\n/g, '\n')}</p>
                    </div>
                  </div>
                );
              }
              return (
                <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-lg whitespace-pre-wrap ${chat.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                    {chat.text}
                  </div>
                </div>
              );
            })}
            {isAiResponding && !isAwaitingTopic && (
                <div className="flex justify-start">
                    <div className="max-w-md p-3 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center">
                        <LoadingSpinner />
                        <span className="ml-2 text-slate-600 dark:text-slate-300">正在傾聽...</span>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {showConclusionOptions && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in">
              <button
                onClick={onContinueAssociating}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                  <ContinueIcon className="w-5 h-5" />
                  繼續感受
              </button>
               {cards.length < 3 && (
                 <button
                    onClick={onDrawAdditionalPair}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                      <AddCardIcon className="w-5 h-5" />
                      再抽一組牌
                  </button>
               )}
              <button
                onClick={onGenerateConclusion}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                  <ConclusionIcon className="w-5 h-5" />
                  接收天使回饋
              </button>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          {isSessionComplete ? (
            <div className="animate-fade-in text-center">
              {blessingImageUrl && (
                  <>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">天使的祝福</h3>
                    <div className="w-full aspect-video bg-slate-200 dark:bg-slate-900/50 rounded-lg mb-4 shadow-md overflow-hidden">
                        <img src={blessingImageUrl} alt="天使的祝福圖卡" className="w-full h-full object-contain" />
                    </div>
                  </>
              )}
              
              {higherSelfQuote && (
                <div className="my-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">高我的一句話</h4>
                  <p className="text-slate-600 dark:text-slate-300 italic">「{higherSelfQuote}」</p>
                </div>
              )}
              
              {!blessingImageUrl && !higherSelfQuote && (
                <p className="text-slate-600 dark:text-slate-400 mb-4">本次對話已告一段落。</p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={onExportConversation}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                  >
                    <ExportIcon className="w-5 h-5" />
                    匯出本次對話
                  </button>
                  <button
                    onClick={onDrawAgain}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <RestartIcon className="w-5 h-5" />
                    重新開始
                  </button>
              </div>
            </div>
          ) : isAwaitingTopic ? (
            <div className="animate-fade-in text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                在為您整理訊息之前，請問您有特別想聚焦的議題嗎？<br/>
                <span className="text-xs">(例如：工作、感情、家庭... 若無可直接送出)</span>
              </p>
              <div className="relative flex gap-2">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={handleTopicKeyDown}
                    placeholder="請輸入議題..."
                    className="w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isAiResponding}
                />
                <button
                    onClick={handleFinalize}
                    disabled={isAiResponding}
                    className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                    送出
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={showConclusionOptions ? "請從上方選擇一個選項..." : "在這裡分享您的感受..."}
                className="w-full p-3 pr-12 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none disabled:bg-slate-200 dark:disabled:bg-slate-800"
                rows={2}
                disabled={isAiResponding || showConclusionOptions}
              />
              <button 
                onClick={handleSend}
                disabled={isAiResponding || !message.trim() || showConclusionOptions}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-indigo-500 hover:bg-indigo-100 dark:hover:bg-slate-700 disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
              >
                <SendIcon className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}