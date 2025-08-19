import React, { useState, useCallback } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BreathingScreen } from './components/BreathingScreen';
import { SelectionScreen } from './components/SelectionScreen';
import { ReflectionScreen } from './components/ReflectionScreen';
import { LoadingScreen } from './components/LoadingScreen';
import type { GameState, CardPair, ChatMessage } from './types';
import { PICTURE_CARD_PROMPTS, WORD_CARDS, HIGHER_SELF_QUOTES } from './constants';
import { generateCardImage, getAiCounselorResponse, getAiCounselorSummary, generateBlessingImage } from './services/geminiService';

export default function App(): React.ReactNode {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [cards, setCards] = useState<CardPair[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);
  const [showConclusionOptions, setShowConclusionOptions] = useState<boolean>(false);
  const [isAwaitingTopic, setIsAwaitingTopic] = useState<boolean>(false);
  const [blessingImageUrl, setBlessingImageUrl] = useState<string | null>(null);
  const [higherSelfQuote, setHigherSelfQuote] = useState<string | null>(null);

  const handleStart = () => {
    setGameState('breathing');
    setError(null);
  };
  
  const handleBreathingComplete = () => {
    setGameState('selection');
  }

  const handleDrawCards = useCallback(async (pictureCardNumber: number, wordCardNumber: number) => {
    setIsLoading(true);
    setGameState('drawing');
    setLoadingMessage('正在連結天使的頻率...');
    setError(null);
    setCards([]);
    setActiveCardIndex(0);
    setChatHistory([]);
    setIsSessionComplete(false);
    setShowConclusionOptions(false);
    setIsAwaitingTopic(false);
    setBlessingImageUrl(null);
    setHigherSelfQuote(null);

    const picturePrompt = PICTURE_CARD_PROMPTS[pictureCardNumber - 1];
    const word = WORD_CARDS[wordCardNumber - 1];

    try {
      setLoadingMessage('正在為您繪製天使的訊息...');
      const imageUrl = await generateCardImage(picturePrompt);
      
      const newCard: CardPair = {
        picture: { number: pictureCardNumber, prompt: picturePrompt, imageUrl },
        word: { number: wordCardNumber, text: word },
      };
      setCards([newCard]);

      const initialMessage: ChatMessage = {
        sender: 'ai',
        text: `天使為您帶來了圖卡 #${pictureCardNumber} 與字卡 #${wordCardNumber}，它所對應的詞彙是「${word}」。\n\n請靜下心來，首先感受這張圖。它為您帶來了什麼樣的訊息或感覺呢？請聆聽您內心的聲音。`,
      };
      setChatHistory([initialMessage]);

      setGameState('reflection');
    } catch (e) {
      console.error(e);
      setError('抱歉，連結天使訊息時遇到問題，請再試一次。');
      setGameState('selection');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrawAdditionalPair = useCallback(async () => {
    if (cards.length >= 3) return;

    setShowConclusionOptions(false);
    setIsAwaitingTopic(false);
    setIsLoading(true);
    setLoadingMessage('正在為您抽取一組新的牌卡...');

    let newPicNum: number, newWordNum: number, isUnique: boolean;
    do {
      newPicNum = Math.floor(Math.random() * PICTURE_CARD_PROMPTS.length) + 1;
      newWordNum = Math.floor(Math.random() * WORD_CARDS.length) + 1;
      isUnique = !cards.some(c => c.picture.number === newPicNum && c.word.number === newWordNum);
    } while (!isUnique);

    const picturePrompt = PICTURE_CARD_PROMPTS[newPicNum - 1];
    const word = WORD_CARDS[newWordNum - 1];

    try {
      setLoadingMessage('正在連結靈感以創造您的新圖像...');
      const imageUrl = await generateCardImage(picturePrompt);
      
      const newPair: CardPair = {
        picture: { number: newPicNum, prompt: picturePrompt, imageUrl },
        word: { number: newWordNum, text: word },
      };
      
      const updatedCards = [...cards, newPair];
      setCards(updatedCards);
      setActiveCardIndex(updatedCards.length - 1);
      
      const newCardMessage: ChatMessage = {
        sender: 'ai',
        text: `天使為您送來了新的指引：圖卡 #${newPicNum} 與字卡 #${newWordNum}，「${word}」。\n\n現在，讓我們聚焦在這組新的訊息上。首先，這張圖帶給您什麼樣的觸動呢？`
      };
      setChatHistory(prev => [...prev, newCardMessage]);
      setIsSessionComplete(false);

    } catch(e) {
      console.error("Error drawing additional card:", e);
      const errorMessage: ChatMessage = { sender: 'ai', text: '抱歉，我在傳遞新的天使訊息時遇到了問題，請稍後再試。' };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [cards]);
  
  const handleSendMessage = useCallback(async (message: string) => {
    if (cards.length === 0 || isSessionComplete) return;

    const userMessage: ChatMessage = { sender: 'user', text: message };
    const updatedChatHistory = [...chatHistory, userMessage];
    setChatHistory(updatedChatHistory);
    setIsLoading(true);
    setLoadingMessage('正在傾聽您的心聲...');
    
    try {
      const aiResponse = await getAiCounselorResponse(cards, activeCardIndex, updatedChatHistory);
      const aiMessage: ChatMessage = { 
        sender: 'ai', 
        text: aiResponse.text,
        isSummary: aiResponse.type === 'summary',
      };
      setChatHistory(prev => [...prev, aiMessage]);

      if (aiResponse.type === 'summary') {
        setIsSessionComplete(true);
      } else if (aiResponse.type === 'conclusion_prompt') {
        setShowConclusionOptions(true);
      }
    } catch(e) {
      console.error(e);
      const errorMessage: ChatMessage = { sender: 'ai', text: '我目前似乎無法順利連結，請稍後再試著傳送您的訊息。' };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [cards, activeCardIndex, chatHistory, isSessionComplete]);

  const handleDrawAgain = () => {
    setGameState('selection');
    setCards([]);
    setActiveCardIndex(0);
    setChatHistory([]);
    setError(null);
    setIsSessionComplete(false);
    setShowConclusionOptions(false);
    setIsAwaitingTopic(false);
    setBlessingImageUrl(null);
    setHigherSelfQuote(null);
  };

  const handleContinueAssociating = () => {
    setShowConclusionOptions(false);
  }

  const handleRequestConclusion = () => {
    if (cards.length === 0) return;
    setShowConclusionOptions(false);
    setIsAwaitingTopic(true);
  };

  const handleFinalizeConclusion = useCallback(async (topic: string | null) => {
    if (cards.length === 0) return;
    setIsAwaitingTopic(false);
    setIsLoading(true);
    setLoadingMessage('正在為您接收天使的回饋...');

    try {
        const historyBeforeSummary = [...chatHistory];
        const summaryResponse = await getAiCounselorSummary(cards, activeCardIndex, historyBeforeSummary, topic);
        const summaryMessage: ChatMessage = {
            sender: 'ai',
            text: summaryResponse.text,
            isSummary: true,
        };
        const historyWithSummary = [...historyBeforeSummary, summaryMessage];
        setChatHistory(historyWithSummary);
        
        setLoadingMessage('正在為您繪製專屬的祝福圖卡...');
        const imageUrl = await generateBlessingImage();
        setBlessingImageUrl(imageUrl);

        const randomIndex = Math.floor(Math.random() * HIGHER_SELF_QUOTES.length);
        setHigherSelfQuote(HIGHER_SELF_QUOTES[randomIndex]);

    } catch(e) {
        console.error("Error generating summary or blessing image:", e);
        const errorMessage: ChatMessage = { sender: 'ai', text: '抱歉，我在為您總結天使訊息或繪製祝福圖卡時遇到了一些困難。' };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsSessionComplete(true);
        setIsLoading(false);
    }
  }, [cards, activeCardIndex, chatHistory]);

  const handleExportConversation = useCallback(() => {
    if (cards.length === 0 && chatHistory.length === 0) return;

    let content = "天使牌卡指引\n====================\n\n";
    
    if (cards.length > 0) {
      content += "抽出的牌卡：\n";
      cards.forEach((card, index) => {
        content += `--- 第 ${index + 1} 組 ---\n`;
        content += `圖卡 #${card.picture.number}: ${card.picture.prompt}\n`;
        content += `字卡 #${card.word.number}: ${card.word.text}\n\n`;
      });
    }

    if (chatHistory.length > 0) {
      content += "對話紀錄：\n====================\n\n";
      chatHistory.forEach(chat => {
        if (chat.sender === 'ai') {
          if (chat.isSummary) {
            content += `天使的回饋:\n${chat.text.replace(/\\n/g, '\n')}\n\n`;
          } else {
            content += `天使訊息: ${chat.text}\n\n`;
          }
        } else {
          content += `你: ${chat.text}\n\n`;
        }
      });
    }

    if (higherSelfQuote) {
        content += `高我的一句話:\n====================\n「${higherSelfQuote}」\n`;
    }
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
    link.download = `天使指引-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [cards, chatHistory, higherSelfQuote]);

  const renderContent = () => {
    if (isLoading && (gameState === 'drawing' || gameState === 'reflection')) {
      return <LoadingScreen message={loadingMessage} />;
    }

    switch (gameState) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} />;
      case 'breathing':
        return <BreathingScreen onComplete={handleBreathingComplete} />;
      case 'selection':
        return <SelectionScreen onDraw={handleDrawCards} error={error} />;
      case 'reflection':
        if (cards.length > 0) {
          return (
            <ReflectionScreen 
              cards={cards}
              activeCardIndex={activeCardIndex}
              onSetActiveCardIndex={setActiveCardIndex}
              chatHistory={chatHistory} 
              onSendMessage={handleSendMessage}
              onDrawAgain={handleDrawAgain}
              onDrawAdditionalPair={handleDrawAdditionalPair}
              isAiResponding={isLoading}
              isSessionComplete={isSessionComplete}
              showConclusionOptions={showConclusionOptions}
              onContinueAssociating={handleContinueAssociating}
              onGenerateConclusion={handleRequestConclusion}
              isAwaitingTopic={isAwaitingTopic}
              onFinalizeConclusion={handleFinalizeConclusion}
              blessingImageUrl={blessingImageUrl}
              higherSelfQuote={higherSelfQuote}
              onExportConversation={handleExportConversation}
            />
          );
        }
        // Fallback to selection if cards are not ready
        setGameState('selection');
        return <SelectionScreen onDraw={handleDrawCards} error="發生了錯誤，請重新選擇您的卡牌。" />;
      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center p-4 font-sans">
      {renderContent()}
    </main>
  );
}