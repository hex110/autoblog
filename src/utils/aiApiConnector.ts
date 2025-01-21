import { PersonalizationApiRequest, PersonalizationApiResponse, createPersonalizationRequest } from '@/types/personalization';

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
    
    // Transform the API response to match our expected format
    return {
      status: data.status,
      service_type: data.service_type,
      recommendations: {
        // Combine all preferences into a comprehensive list
        selectedOptions: [
          // Content preferences
          data.recommendations.content_preferences.content_style,
          data.recommendations.content_preferences.tone,
          ...(data.recommendations.content_preferences.emphasis_techniques || []),
          // Visual preferences
          data.recommendations.visual_preferences.spacing,
          data.recommendations.visual_preferences.formatting,
        ].filter(Boolean),
        // Create a detailed custom prompt that captures all preferences
        customPrompt: [
          `Content style: ${data.recommendations.content_preferences.content_style}`,
          `Tone: ${data.recommendations.content_preferences.tone}`,
          `Emphasis: ${data.recommendations.content_preferences.emphasis_techniques?.join(', ')}`,
          `Spacing: ${data.recommendations.visual_preferences.spacing}`,
          `Formatting: ${data.recommendations.visual_preferences.formatting}`,
        ].filter(Boolean).join('\n'),
        userDescription: data.recommendations.content_preferences.content_style || 'Customized reader'
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