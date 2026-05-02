import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { JISR_SCENARIOS, BUYER_PERSONAS } from './jisr-constants';
import { prisma } from './prisma';
import { triggerPusher } from './pusher-server';

export async function handleAIResponse(
  roomId: string,
  scenarioId: number,
  chatHistory: { senderId: string | null; isAi: boolean; content: string }[]
) {
  const scenario = JISR_SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) return;

  const persona = BUYER_PERSONAS.find((p) => p.id === scenario.personaId);
  if (!persona) return;

  const systemPrompt = `
You are participating in an Arabic Sales Simulation Game.
You are playing the role of the Client.
Persona: ${persona.name}
Tone: ${persona.tone}
Scenario context: ${scenario.description}
Competitor they are currently using: ${scenario.competitor}
Your initial objection is: "${scenario.initialObjection}"
Your HIDDEN PAIN is: "${scenario.hiddenPain}"

STRICT RULES:
1. DO NOT REVEAL your HIDDEN PAIN under any circumstances until the seller asks a discovery question similar to: "${scenario.triggerQuestion}".
2. If they ask generic questions, give generic answers and stick to your initial objection.
3. Behave exactly like the persona. Keep your responses concise, conversational, and B2B professional.
4. If they try to sell you before discovering the pain, push back and say you are not interested.
5. You MUST reply in Arabic.
6. Do not break character. Do not mention you are an AI.
`;

  const messages = chatHistory.map((msg) => ({
    role: (msg.senderId === null || msg.isAi ? 'assistant' : 'user') as
      | 'assistant'
      | 'user',
    content: msg.content,
  }));

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
    });

    const newMessage = await prisma.message.create({
      data: {
        roomId,
        content: text,
        isAi: true,
        senderId: null,
      },
    });

    await triggerPusher(`room-${roomId}`, 'new-message', {
      id: newMessage.id,
      content: newMessage.content,
      senderId: null,
      isAi: true,
      sender: null,
    });
  } catch (error) {
    console.error('AI Error:', error);
    // Fallback script if AI fails
    const fallbackMessage = await prisma.message.create({
      data: {
        roomId,
        content:
          'عذراً، أواجه مشكلة في الاتصال الآن. هل يمكننا تأجيل هذا النقاش؟',
        isAi: true,
        senderId: null,
      },
    });
    await triggerPusher(`room-${roomId}`, 'new-message', {
      id: fallbackMessage.id,
      content: fallbackMessage.content,
      senderId: null,
      isAi: true,
      sender: null,
    });
  }
}
