import { generate, isErrorResponse } from "@/utils/llmClient";

export async function POST(request: Request) {
  const { markdown, selectedOptions, customPrompt } = await request.json();
  
  // Parse the custom prompt into sections if it contains our structured format
  const preferences: Record<string, string> = {};
  if (customPrompt) {
    customPrompt.split('\n').forEach((line: string) => {
      const [key, value] = line.split(': ');
      if (key && value) {
        preferences[key.toLowerCase()] = value;
      }
    });
  }

  const fullPrompt = `You will receive a markdown file, and you will modify it based on the user's preferences and requirements:

USER PREFERENCES:
${Object.entries(preferences).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
${selectedOptions.length > 0 ? `- Additional preferences: ${selectedOptions.join(', ')}` : ''}
${customPrompt && !customPrompt.includes(': ') ? `- Custom instructions: ${customPrompt}` : ''}

MODIFICATION RULES:
1. Content Style:
   - Follow the user's content style and tone preferences exactly
   - Use specified emphasis techniques (emojis, capitalization, etc.) as requested
   - Maintain the specified level of formality/informality
   
2. Visual Formatting:
   - Follow the user's spacing preferences
   - Use the requested markdown formatting style
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