import https from 'https';
import http from 'http';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function chatCompletion(
  messages: ChatMessage[],
  model?: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const selectedModel = model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

  const body = JSON.stringify({
    model: selectedModel,
    messages,
    max_tokens: 2000,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'FinanceFlow',
        },
      },
      (res: http.IncomingMessage) => {
        let data = '';
        res.on('data', (chunk: Buffer) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed: OpenRouterResponse = JSON.parse(data);
            if (parsed.choices && parsed.choices.length > 0) {
              resolve(parsed.choices[0].message.content);
            } else {
              reject(new Error('No response from AI model: ' + data));
            }
          } catch {
            reject(new Error('Failed to parse AI response: ' + data));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function visionCompletion(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const model = process.env.OPENROUTER_VISION_MODEL || process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
  return chatCompletion(
    [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
          },
        ],
      },
    ],
    model
  );
}
