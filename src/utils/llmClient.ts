import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

const ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022";
const GEMINI_MODEL = "models/gemini-1.5-pro-latest";

interface LLMResponse {
  text: string;
  provider: 'anthropic' | 'gemini' | 'error';
  error?: string;
}

async function generateWithAnthropic(prompt: string, maxTokens: number): Promise<LLMResponse> {
  try {
    const { text } = await generateText({
      model: anthropic(ANTHROPIC_MODEL),
      prompt,
      maxTokens
    });
    return { text, provider: 'anthropic' };
  } catch (error) {
    console.error('Anthropic generation failed:', error);
    throw error;
  }
}

async function generateWithGemini(prompt: string, maxTokens: number): Promise<LLMResponse> {
  try {
    const { text } = await generateText({
      model: google(GEMINI_MODEL),
      prompt,
      maxTokens
    });
    return { text, provider: 'gemini' };
  } catch (error) {
    console.error('Gemini generation failed:', error);
    throw error;
  }
}

export async function generate(prompt: string, maxTokens: number = 1000): Promise<LLMResponse> {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  try {
    // Try Anthropic first if API key exists
    if (anthropicApiKey) {
      try {
        return await generateWithAnthropic(prompt, maxTokens);
      } catch (error) {
        console.warn('Anthropic generation failed, falling back to Gemini:', error);
      }
    }

    // Try Gemini if API key exists
    if (geminiApiKey) {
      try {
        return await generateWithGemini(prompt, maxTokens);
      } catch (error) {
        console.error('Gemini generation failed:', error);
        throw error;
      }
    }

    // No API keys available
    throw new Error('No LLM API keys configured. Please set ANTHROPIC_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.');
  } catch (error) {
    console.error('Text generation failed:', error);
    return {
      text: '',
      provider: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Helper function to check if a response indicates an error
export function isErrorResponse(response: LLMResponse): boolean {
  return response.provider === 'error' || !response.text;
}

// Helper function to get a standardized error response
export function createErrorResponse(error: unknown): LLMResponse {
  return {
    text: '',
    provider: 'error',
    error: error instanceof Error ? error.message : 'Unknown error occurred'
  };
} 