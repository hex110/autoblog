import { Anthropic } from "@anthropic-ai/sdk";
import { PersonalizationApiRequest, PersonalizationApiResponse, createPersonalizationRequest } from '@/types/personalization';


interface AIResponse {
  text: string;
}

export async function fetchUserDescription(selectedOptions: string[], customPrompt: string): Promise<AIResponse> {
  try {
    const response = await fetch('/api/describe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedOptions, customPrompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate description');
    }

    const data = await response.json();
    return { text: data.text };
  } catch (error) {
    console.error('Error fetching user description:', error);
    return { text: '' };
  }
}

export async function fetchModifiedMarkdown(markdown: string, selectedOptions: string[], customPrompt: string): Promise<AIResponse> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ markdown, selectedOptions, customPrompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate markdown');
    }

    const data = await response.json();
    return { text: data.text };
  } catch (error) {
    console.error('Error fetching modified markdown:', error);
    return { text: markdown };
  }
}

export async function fetchPersonalizationFromApi(selectedOptions: string[], customPrompt: string): Promise<PersonalizationApiResponse> {
  const request = createPersonalizationRequest(selectedOptions, customPrompt);
  
  const response = await fetch('/api/personalize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data: PersonalizationApiResponse = await response.json();
  
  if (data.status === 'error') {
    throw new Error('API returned error status');
  }

  return data;
}