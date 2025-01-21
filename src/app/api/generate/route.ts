import { generate, isErrorResponse } from "@/utils/llmClient";
import { UserPreferences } from "@/types/personalization";

export async function POST(request: Request) {
  const { markdown, preferences } = await request.json();
  
  const fullPrompt = `You will receive a markdown file, and you will modify it based on the user's preferences and requirements:

USER PREFERENCES:
${preferences.content_preferences ? `Content Style:
- Style: ${preferences.content_preferences.content_style || 'default'}
- Tone: ${preferences.content_preferences.tone || 'default'}
- Language: ${preferences.content_preferences.language || 'default'}
- Emphasis: ${preferences.content_preferences.emphasis || 'default'}` : ''}

${preferences.visual_preferences ? `Visual Style:
- Emoji Usage: ${preferences.visual_preferences.emoji_usage || 'default'}
- Spacing: ${preferences.visual_preferences.spacing || 'default'}
- Layout: ${preferences.visual_preferences.layout || 'default'}` : ''}

${preferences.reasoning?.main_points ? `Key Points:
${preferences.reasoning.main_points.map((point: string) => `- ${point}`).join('\n')}` : ''}

${preferences.reasoning?.additional_notes ? `Additional Notes:
${Object.entries(preferences.reasoning.additional_notes)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}` : ''}

${preferences.selectedOptions?.length ? `Additional Preferences:
${preferences.selectedOptions.map((opt: string) => `- ${opt}`).join('\n')}` : ''}

${preferences.customPrompt ? `Custom Instructions:
${preferences.customPrompt}` : ''}

MODIFICATION RULES:
1. Content Style:
   - Follow the user's content style and tone preferences exactly
   - Use specified emphasis techniques and language style
   - Maintain the specified level of formality/informality
   
2. Visual Formatting:
   - Follow the user's spacing and layout preferences
   - Use emojis according to specified preference
   - Preserve the overall document structure unless big changes are requested

3. Content Preservation:
   - Keep all links and quotes intact (you may move or translate them if requested)
   - Preserve important content from the original
   - Explain or remove jargon based on user preferences
   - Remove any inline wishes from the output (e.g. {{wish}}) unless explicitly requested to keep them

4. Output Format:
   - Return ONLY valid markdown
   - No explanations or additional text outside the markdown content

MARKDOWN TO MODIFY:
${markdown}`;

  const response = await generate(fullPrompt, 8192);
  
  if (isErrorResponse(response)) {
    return Response.json({ error: response.error }, { status: 500 });
  }

  return Response.json({ text: response.text });
}