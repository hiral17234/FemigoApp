'use server';
/**
 * @fileOverview A friendly AI chat assistant named Sangini, running a local simulation.
 *
 * - askSangini - The main function to interact with the assistant.
 * - SanginiChatInput - The input type for the chat flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const SanginiChatInputSchema = z.object({
  history: z.array(MessageSchema),
  prompt: z.string().describe('The latest message from the user.'),
});
export type SanginiChatInput = z.infer<typeof SanginiChatInputSchema>;

// This is the local simulation that will run instantly for your hackathon demo.
const runLocalSimulation = async (prompt: string): Promise<string> => {
    // A small delay to simulate the AI "thinking"
    await new Promise(resolve => setTimeout(resolve, 800));

    const p = prompt.toLowerCase();

    // Greetings
    if (p.includes('hello') || p.includes('hi') || p.includes('hey')) {
        const responses = [
            "Hello there! I'm Sangini, your personal safety companion. How can I empower you today?",
            "Hi! Sangini here. I'm ready to help. What's on your mind?",
            "Hey! So glad you reached out. I'm here to support you."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Asking for help / SOS
    if (p.includes('help') || p.includes('sos') || p.includes('emergency')) {
        return "If this is an emergency, please use the SOS button on the dashboard to contact authorities or your trusted contacts immediately. For safety tips or a friendly chat, just ask!";
    }

    // Asking for safety tips
    if (p.includes('safety') && p.includes('tip')) {
        const tips = [
            "A great safety tip is to always be aware of your surroundings. Avoid walking alone at night if possible, and always let someone know your route and estimated arrival time. Stay strong and stay safe!",
            "Always trust your gut instinct. If a situation or person feels off, it probably is. Remove yourself from the situation as quickly and safely as you can.",
            "When traveling, share your live location with a trusted friend or family member. You can do this right from the Femigo app!",
            "Consider carrying a personal safety alarm. It can be a powerful deterrent and attract attention when you need it most."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    // Feeling unsafe or scared
    if (p.includes('scared') || p.includes('unsafe') || p.includes('nervous')) {
        return "I hear you, and it's okay to feel that way. Take a deep breath. Your safety is the priority. Can you tell me more about what's happening? If you're in immediate danger, please use the SOS feature.";
    }

    // Thank you
    if (p.includes('thank')) {
        return "You're very welcome! I'm always here if you need me. Remember, you've got this. Stay safe!";
    }

    // Default catch-all responses
    const defaultResponses = [
        "That's a great question. As your safety companion, I'm here to support you. Remember to always trust your instincts and prioritize your well-being.",
        "I understand. Your feelings are valid. Let's talk through it. What's on your mind?",
        "I'm here to listen. Tell me more.",
        "Thank you for sharing that with me. Remember, your strength is greater than any struggle."
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};


const sanginiChatFlow = ai.defineFlow(
  {
    name: 'sanginiChatFlow',
    inputSchema: SanginiChatInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, prompt }) => {
    // This provides an instant, interactive experience for the hackathon.
    console.log("Sangini Chat in LOCAL SIMULATION MODE.");
    return runLocalSimulation(prompt);
  }
);

export async function askSangini(input: SanginiChatInput): Promise<string> {
    return sanginiChatFlow(input);
}
