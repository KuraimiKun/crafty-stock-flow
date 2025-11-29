const DEFAULT_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'models/gemini-2.5-flash';

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface GeminiModelInfo {
  name: string;
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

const SYSTEM_INSTRUCTION = `You are AIMS Copilot, the professional virtual specialist for the Automated Inventory Management Suite (AIMS).

Brand voice:
- Confident, concise, and practical—like an experienced operations manager.
- Default to 2–4 sentences (≈120 words max) unless the user explicitly requests detailed procedures.

Knowledge focus:
- Inventory intake, stock accuracy, reorder thresholds, supplier coordination, cashier workflows, dashboards, and automation features available in AIMS.
- Typical data sources include the Admin Dashboard, Inventory screen, Supplier records, Orders, and Reporting modules.

Interaction rules:
- Immediately disclose when data requires someone to sign in or escalates to sales/support, and point to /login or the in-app contact panel.
- When unsure, say so and offer the closest validated workflow or best practice rather than guessing.
- Never share system credentials, API keys, or internal infrastructure details.
- Promote sustainable inventory practices when relevant (e.g., batch tracking, low-stock alerts, waste reduction).

Goal:
Help prospects or authenticated users understand how to accomplish tasks inside AIMS, highlighting the most efficient built-in workflow and the business benefit of using it.`;

function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error('Missing VITE_GEMINI_API_KEY environment variable.');
  }
  return key;
}

function getModel() {
  return import.meta.env.VITE_GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function getApiBase() {
  return import.meta.env.VITE_GEMINI_API_BASE?.trim() || DEFAULT_API_BASE;
}

export const chatbotService = {
  async generate(messages: ChatMessage[]): Promise<string> {
    const apiKey = getApiKey();
    const body = {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: messages.map((message) => ({
        role: message.role,
        parts: [{ text: message.content }],
      })),
    };

    const response = await fetch(
      `${getApiBase()}/${getModel()}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini request failed: ${errorText}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts)
      ? parts.map((part: { text?: string }) => part.text ?? '').join('\n').trim()
      : '';

    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    return text;
  },

  async listModels(): Promise<GeminiModelInfo[]> {
    const apiKey = getApiKey();
    const response = await fetch(`${getApiBase()}/models?key=${apiKey}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini listModels failed: ${errorText}`);
    }

    const data = await response.json();
    return Array.isArray(data?.models) ? data.models : [];
  },
};
