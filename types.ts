export type GameState = 'welcome' | 'breathing' | 'selection' | 'drawing' | 'reflection';

export interface PictureCard {
  number: number;
  prompt: string;
  imageUrl: string;
}

export interface WordCard {
  number: number;
  text: string;
}

export interface CardPair {
  picture: PictureCard;
  word: WordCard;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  isSummary?: boolean;
}

export type AiResponseType = {
  type: 'question' | 'summary' | 'conclusion_prompt';
  text: string;
}