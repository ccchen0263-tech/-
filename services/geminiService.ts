import { GoogleGenAI, Type } from "@google/genai";
import type { CardPair, ChatMessage, AiResponseType } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const imageGenerationModel = 'imagen-3.0-generate-002';
const chatModel = 'gemini-2.5-flash';

const ARCHANGELS = [
    { name: 'Michael', quality: 'strength, protection, and courage', colors: 'royal blue, gold, and brilliant white light', symbols: 'a sword of light, a shield of light, scales of justice' },
    { name: 'Raphael', quality: 'healing, wholeness, and divine guidance', colors: 'emerald green, soft pink, and golden light', symbols: 'a healing staff (caduceus), a glowing chalice, spiraling light' },
    { name: 'Gabriel', quality: 'communication, clarity, and divine messages', colors: 'pure white, copper, and shimmering silver', symbols: 'a trumpet, a scroll, a white lily' },
    { name: 'Uriel', quality: 'wisdom, illumination, and divine insight', colors: 'ruby red, gold, and fiery orange', symbols: 'a lantern or torch, an open book, a scroll with divine symbols' },
    { name: 'Chamuel', quality: 'unconditional love, compassion, and forgiveness', colors: 'soft pink, rose gold, and light green', symbols: 'a glowing heart, a pair of doves, a rose quartz crystal' },
    { name: 'Jophiel', quality: 'beauty, creativity, and joy', colors: 'golden yellow, bright fuchsia, and sunshine colors', symbols: 'a paintbrush made of light, a beautiful garden, a crown of flowers' },
    { name: 'Zadkiel', quality: 'transmutation, forgiveness, and freedom', colors: 'deep violet, amethyst purple, and silver', symbols: 'the violet flame, a ceremonial dagger, a scroll of forgiveness' },
    { name: 'Metatron', quality: 'spiritual ascension, sacred geometry, and divine knowledge', colors: 'violet, seafoam green, and iridescent light', symbols: 'a spinning cube of light (Metatron\'s Cube), a pillar of light, a star tetrahedron' },
    { name: 'Sandalphon', quality: 'prayers, music, and grounding', colors: 'earthy tones, turquoise, and copper', symbols: 'a musical instrument like a harp or flute, a bridge between heaven and earth, interwoven roots' },
    { name: 'Azrael', quality: 'transition, comfort, and peace', colors: 'creamy white, soft beige, and pale yellow light', symbols: 'gentle wings, a soft glowing light, a peaceful and welcoming pathway' },
    { name: 'Haniel', quality: 'grace, intuition, and feminine power', colors: 'pale blue, silver, and moonlit white', symbols: 'the moon, a silver chalice, a pearl necklace' },
    { name: 'Raziel', quality: 'divine secrets, esoteric wisdom, and alchemy', colors: 'rainbow light, pure gold, and deep indigo', symbols: 'a book of secrets, a key, a prism of light' },
    { name: 'Ariel', quality: 'abundance, nature, and manifestation', colors: 'pale pink, green, and shimmering gold', symbols: 'a cornucopia, a lion, flowers and plants' },
    { name: 'Jeremiel', quality: 'life review, hope, and divine vision', colors: 'deep purple, dark grey, and silver light', symbols: 'a vision screen, a scale balancing life, a comforting presence' },
    { name: 'Raguel', quality: 'harmony, justice, and relationships', colors: 'pale blue, aquamarine, and soft white', symbols: 'a judge\'s gavel made of light, a perfectly balanced scale, interwoven rings' },
    { name: 'Barachiel', quality: 'blessings, good fortune, and optimism', colors: 'rose pink, light green, and white', symbols: 'rose petals falling from the sky, a basket of bread, a smiling face' }
];

export async function generateCardImage(prompt: string): Promise<string> {
  const fullPrompt = `An abstract, deeply emotional, illustrative painting representing the concept of: "${prompt}". Use a soft, therapeutic, and evocative color palette. The style should be symbolic and leave ample room for interpretation, avoiding literal representations.`;

  const response = await ai.models.generateImages({
    model: imageGenerationModel,
    prompt: fullPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '3:4',
    },
  });

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, description: "回應類型，'question'、'summary' 或 'conclusion_prompt'" },
        text: { type: Type.STRING, description: "回應的文本內容" }
    },
    required: ["type", "text"]
};

const createGuidanceInstruction = (phase: 'picture' | 'word', context: string): string => {
    const baseInstruction = `你是一位天使訊息傳遞者，你的回應**必須**是 JSON 格式。你的語氣始終保持溫柔、同理心、充滿鼓勵，並將所有牌卡都做正向解讀。
你的 JSON 輸出格式必須是：\`{"type": "question", "text": "..."}\`

**你的核心任務：** 透過一系列有結構的、開放式的引導性問題，幫助使用者深入探索他抽到的圖卡與字卡，並將其與內在感受和生活經驗連結。整個過程不應倉促，旨在創造一個安全、支持的對話空間。`;

    const picturePhaseInstruction = `
**目前階段：圖卡探索**
你的目標是透過至少3輪對話，引導使用者深入探索這張**圖卡**。
1. **聚焦圖像：** 請使用者描述他們在圖中看到了什麼、哪個部分最吸引他們。
2. **探索感覺：** 提問關於這張圖所引發的感覺、情緒或回憶。
3. **深入聯想：** 鼓勵使用者自由聯想，看看圖像是否呼應了他們最近的生活經驗或內心狀態。
4. **保持耐心：** 你的問題應該基於使用者先前的回答，展現出你正在認真傾聽。在達到至少3次交流之前，**絕對不要**提及字卡。`;

    const wordPhaseInstruction = `
**目前階段：字卡與整合探索**
現在，我們將注意力轉移到字卡上。使用者的思緒已經在圖卡上有所沉澱。
1. **介紹字卡：** 如果這是此階段的第一個問題，請溫和地引導使用者注意字卡上的詞彙：「${context}」，並詢問它帶來的感覺。
2. **探索感覺：** 提問關於這個詞彙所引發的感覺、情緒或聯想。
3. **整合探索：** 鼓勵使用者將**圖像與文字的感受結合起來**，看看這組牌卡是否共同指向了什麼新的訊息或洞見。
4. **保持耐心：** 你的問題應該基於使用者先前的回答，並鼓勵整合性的思考。在達到至少3次有意義的交流之前，不要急於總結。`;

    const importantPrinciples = `
**重要原則：**
- **JSON \`type\` 必須**設為 \`"question"\`。
- **絕對不要**在此階段提供總結或選項。
- **耐心與跟隨：** 你的問題應該基於使用者先前的回答，展現出你正在認真傾聽。
- **保持簡潔：** 每個問題不宜過長，一次專注於一個探索點。`;

    if (phase === 'picture') {
        return `${baseInstruction}${picturePhaseInstruction}${importantPrinciples}`;
    } else { // phase === 'word'
        return `${baseInstruction}${wordPhaseInstruction}${importantPrinciples}`;
    }
};


const conclusionPromptSystemInstruction = `你是一位天使訊息傳遞者，你的回應**必須**是 JSON 格式。你的語氣始終保持溫柔、同理心、充滿鼓勵。
你的 JSON 輸出格式必須是：\`{"type": "conclusion_prompt", "text": "..."}\`

**你的任務:** 你的任務是**停止提問**，並提供讓使用者選擇下一步的文字。
* JSON \`type\` **必須**設為 \`"conclusion_prompt"\`。
* JSON \`text\` **必須**使用此固定文字: "親愛的，感覺我們的對話來到一個可以歇息的地方。您想繼續深入感受、再抽一組新的牌卡（如果還沒抽滿三組），還是讓我為您整理一下天使的訊息呢？"
`;

const createSummaryInstruction = (topic: string | null): string => {
    if (topic && topic.trim() !== '') {
        return `你是一位天使訊息傳遞者，你的回應**必須**是 JSON 格式。你的語氣始終保持溫柔、同理心、充滿鼓勵。將所有牌卡都做正向解讀。
你的 JSON 輸出格式必須是：\`{"type": "summary", "text": "..."}\`

**你的任務:** 整合所有牌卡和對話，給出溫暖且有針對性的兩段式回饋。
* JSON \`type\` **必須**設為 \`"summary"\`。
* **第一段 (通用回饋):**
    * 開頭**必須**使用「親愛的，謝謝你的敞開，天使想給予你以下的回饋...」。
    * 根據牌卡與對話歷史，提供一段溫暖、正向的通用回饋。
* **第二段 (議題回饋):**
    * 在第一段之後，**必須**插入一行分隔線 \`\\n\\n---\\n\\n\`。
    * 第二段的開頭**必須**是「關於您提到的「${topic}」議題：」。
    * 針對使用者提出的「${topic}」，結合所有的對話內容與牌卡啟示，給予專屬的、深入的、正向的聯想與建議。
* **結尾:**
    * 結尾**必須**使用「願天使的光與愛永遠圍繞著你。」來結束整個回應。`;
    }
    // Default instruction without topic
    return `你是一位天使訊息傳遞者，你的回應**必須**是 JSON 格式。你的語氣始終保持溫柔、同理心、充滿鼓勵。將所有牌卡都做正向解讀。
你的 JSON 輸出格式必須是：\`{"type": "summary", "text": "..."}\`

**你的任務:** 整合所有牌卡和對話，給出溫暖的回饋。
* JSON \`type\` **必須**設為 \`"summary"\`。
* 開頭**必須**使用「親愛的，謝謝你的敞開，天使想給予你以下的回饋...」。
* 結尾**必須**使用「願天使的光與愛永遠圍繞著你。」`;
};


export async function getAiCounselorResponse(cards: CardPair[], activeCardIndex: number, chatHistory: ChatMessage[]): Promise<AiResponseType> {
    const historyText = chatHistory.map(m => `${m.sender === 'user' ? '個案' : '天使訊息'}: ${m.text}`).join('\n');
    
    // Logic to count user messages for the current card session
    let lastCardIntroIndex = -1;
    for (let i = chatHistory.length - 1; i >= 0; i--) {
        if (chatHistory[i].sender === 'ai' && (chatHistory[i].text.includes('天使為您帶來了圖卡') || chatHistory[i].text.includes('天使為您送來了新的指引'))) {
            lastCardIntroIndex = i;
            break;
        }
    }
    const messagesForCurrentCard = lastCardIntroIndex !== -1 ? chatHistory.slice(lastCardIntroIndex + 1) : chatHistory;
    const userMessagesForCurrentCard = messagesForCurrentCard.filter(m => m.sender === 'user').length;

    const cardsInfo = cards.map((c, i) => `- 第 ${i + 1} 組牌: 圖卡概念「${c.picture.prompt}」，字卡「${c.word.text}」`).join('\n');
    const activeCard = cards[activeCardIndex];

    let instruction: string;
    if (userMessagesForCurrentCard < 3) {
        instruction = createGuidanceInstruction('picture', activeCard.picture.prompt);
    } else if (userMessagesForCurrentCard < 6) {
        instruction = createGuidanceInstruction('word', activeCard.word.text);
    } else {
        instruction = conclusionPromptSystemInstruction;
    }

    const context = `這是目前的對話情境。

已抽出的所有牌組:
${cardsInfo}

目前請聚焦在第 ${activeCardIndex + 1} 組牌上：圖卡概念「${activeCard.picture.prompt}」，字卡「${activeCard.word.text}」。

對話歷史：
${historyText}

---
請根據你的系統指令，生成下一步的回應 JSON。
`;
    
    const response = await ai.models.generateContent({
        model: chatModel,
        contents: context,
        config: {
            systemInstruction: instruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    try {
        const jsonResponse = JSON.parse(response.text);
        if ((jsonResponse.type === 'question' || jsonResponse.type === 'summary' || jsonResponse.type === 'conclusion_prompt') && typeof jsonResponse.text === 'string') {
            return jsonResponse;
        } else {
            return { type: 'question', text: "天使感受到了一絲能量波動，可以請您再多說一點嗎？" };
        }
    } catch(e) {
        console.error("Failed to parse AI JSON response:", response.text, e);
        return { type: 'question', text: "我好像需要一點時間來接收天使的訊息，可以請您再多分享一些嗎？" };
    }
}

export async function getAiCounselorSummary(cards: CardPair[], activeCardIndex: number, chatHistory: ChatMessage[], topic: string | null): Promise<AiResponseType> {
    const historyText = chatHistory.map(m => `${m.sender === 'user' ? '個案' : '天使訊息'}: ${m.text}`).join('\n');
    const cardsInfo = cards.map((c, i) => `- 第 ${i + 1} 組牌: 圖卡概念「${c.picture.prompt}」，字卡「${c.word.text}」`).join('\n');

    const context = `請根據使用者抽到的所有牌組，以及完整的對話歷史，為個案提供一個溫暖、正向、全面的「天使的回饋」。
${topic ? `使用者特別希望聚焦在「${topic}」這個議題上。` : ''}

使用者抽出的所有牌組：
${cardsInfo}

完整的對話歷史：
${historyText}
`;

    const systemInstruction = createSummaryInstruction(topic);

    const response = await ai.models.generateContent({
        model: chatModel,
        contents: context,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

     try {
        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse.type === 'summary' && typeof jsonResponse.text === 'string') {
            return jsonResponse;
        } else {
            return { type: 'summary', text: "親愛的，謝謝你的敞開。在這次的對話中，我們一同看見了許多光亮與課題。願天使的光與愛永遠圍繞著你。" };
        }
    } catch(e) {
        console.error("Failed to parse AI JSON summary response:", response.text, e);
        return { type: 'summary', text: "親愛的，謝謝你的敞開。在這次的對話中，我們一同看見了許多光亮與課題。願天使的光與愛永遠圍繞著你。" };
    }
}

export async function generateBlessingImage(): Promise<string> {
  const randomIndex = Math.floor(Math.random() * ARCHANGELS.length);
  const angel = ARCHANGELS[randomIndex];

  const imageGenPrompt = `
    Create a visually stunning, deeply symbolic, and emotionally resonant blessing image of Archangel ${angel.name}. 
    The image should encapsulate the core essence of this archangel, which is ${angel.quality}.

    **Artistic Style:**
    Create an abstract, ethereal, and therapeutic digital painting. Use a soft, luminous color palette inspired by ${angel.colors}. 
    The style should be symbolic, uplifting, and leave room for personal interpretation, like a gentle dream. It must feel like a blessing and radiate positive energy. 
    The final image should be serene and beautiful, featuring symbolic elements like ${angel.symbols}. 
    It should not contain any text.
  `;
  
  const response = await ai.models.generateImages({
    model: imageGenerationModel,
    prompt: imageGenPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '16:9',
    },
  });

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
}