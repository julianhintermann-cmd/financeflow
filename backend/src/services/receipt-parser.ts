import { visionCompletion } from './openrouter';
import { ReceiptParseResult } from '../types';
import fs from 'fs';
import path from 'path';

export async function parseReceipt(filePath: string): Promise<ReceiptParseResult> {
  const absolutePath = path.resolve(filePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64 = imageBuffer.toString('base64');

  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  const mimeType = mimeMap[ext] || 'image/jpeg';

  const prompt = `You are an expert at reading receipts and invoices.
Analyze this image of a receipt/invoice and extract the following information.
Respond ONLY with a JSON object in the following format, no additional text:
{
  "amount": <total amount as a number or null>,
  "description": "<short description of the purchase or null>",
  "date": "<date in YYYY-MM-DD format or null>",
  "suggestedCategory": "<one of the following categories: Groceries, Transport, Housing, Entertainment, Health, Other, or null>"
}`;

  const response = await visionCompletion(base64, mimeType, prompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ReceiptParseResult;
    }
  } catch {
    // Fall through to default
  }

  return { amount: null, description: null, date: null, suggestedCategory: null };
}
