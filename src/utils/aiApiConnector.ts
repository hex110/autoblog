import { PersonalizationApiRequest, PersonalizationApiResponse, UserPreferences, createPersonalizationRequest } from '@/types/personalization';

interface AIResponse {
  text: string;
  error?: string;
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
    if (data.error) {
      throw new Error(data.error);
    }
    return { text: data.text };
  } catch (error) {
    console.error('Error fetching user description:', error);
    return { text: '', error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export async function fetchModifiedMarkdown(markdown: string, preferences: UserPreferences): Promise<AIResponse> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ markdown, preferences }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate markdown');
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return { text: data.text };
  } catch (error) {
    console.error('Error fetching modified markdown:', error);
    return { text: markdown, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export async function fetchPersonalizationFromApi(selectedOptions: string[], customPrompt: string): Promise<PersonalizationApiResponse> {
  const request = createPersonalizationRequest(selectedOptions, customPrompt);
  
  try {
    const response = await fetch('http://localhost:8000/personalize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Create new preferences object with full API response
    return {
      status: data.status,
      service_type: data.service_type,
      recommendations: {
        content_preferences: data.recommendations.content_preferences,
        visual_preferences: data.recommendations.visual_preferences,
      },
      reasoning: data.reasoning,
      metadata: data.metadata
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch failed')) {
      throw new Error('Could not connect to personalization server. Is it running at localhost:8000?');
    }
    throw error;
  }
}