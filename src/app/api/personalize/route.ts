import { generate } from "@/utils/anthropicClient";
import { PersonalizationApiRequest, PersonalizationApiResponse } from "@/types/personalization";

export async function POST(request: Request) {
  const requestData: PersonalizationApiRequest = await request.json();
  
  // For now, we'll use a similar prompt structure as the describe endpoint
  // but expanded to get more detailed personalization recommendations
  const fullPrompt = `You are a personalization assistant that helps customize blog content.
Based on the user's preferences and context, generate personalization recommendations.
Return ONLY a JSON response matching the PersonalizationApiResponse type, with recommendations for how the content should be customized.

User preferences: ${requestData.preferences.join(", ")}
Content type: ${requestData.content.type}
Customization aspects: ${requestData.content.customization_aspects.join(", ")}

Generate a response that includes:
1. Recommended options for viewing the content
2. A custom prompt that captures their preferences
3. A short description of the user (2-4 words)
4. Reasoning for the recommendations
5. Any pattern-based or trait-based insights

Format your response as valid JSON matching this structure:
{
  "status": "success",
  "service_type": "blog",
  "recommendations": {
    "selectedOptions": string[],
    "customPrompt": string,
    "userDescription": string
  },
  "reasoning": {
    "main_points": string[],
    "trait_based": Record<string, string>,
    "pattern_based": Record<string, string>,
    "additional_notes": Record<string, any>
  },
  "metadata": {
    "processed_at": string,
    "version": string
  }
}`;

  const maxTokens = 1000;
  const response = await generate(fullPrompt, maxTokens);
  
  try {
    const parsedResponse = JSON.parse(response.text) as PersonalizationApiResponse;
    return Response.json(parsedResponse);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return Response.json({
      status: 'error',
      service_type: 'blog',
      recommendations: {
        selectedOptions: requestData.preferences,
        customPrompt: '',
        userDescription: 'Error parsing response'
      },
      reasoning: {
        main_points: ['Error occurred'],
        trait_based: {},
        pattern_based: {},
        additional_notes: { error: 'Failed to parse AI response' }
      },
      metadata: {
        processed_at: new Date().toISOString(),
        version: '1.0.0'
      }
    } as PersonalizationApiResponse, { status: 500 });
  }
} 