import { generate, isErrorResponse } from "@/utils/llmClient";

export async function POST(request: Request) {
  const { selectedOptions, customPrompt } = await request.json();
  const fullPrompt = `You will receive 0+ selected options and a (potentially empty) self-written description given by the user. Describe this person in 2-4 words, print nothing but the description.
   Selected options: ${selectedOptions}
   User description: ${customPrompt}`;
  
  const response = await generate(fullPrompt, 40);
  
  if (isErrorResponse(response)) {
    return Response.json({ error: response.error }, { status: 500 });
  }

  return Response.json({ text: response.text });
}
