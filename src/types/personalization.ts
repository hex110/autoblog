export const PRESET_OPTIONS: string[] = [
  "Artificial intelligence",
  "Interface design",
  "Autostructures/Live theory",
  "I have a technical background",
  "I have a design background",
  "Make everything a lot more concise",
  "Describe with emojis as much as possible",
  "Explain Like I'm 5"
];

export interface PersonalizationApiRequest {
  context: {
    service_type: string;
    request_type: string;
    user_id: string;
    parameters: {
      content_type: string;
      target_audience?: string;
    };
  };
  content: {
    type: string;
    customization_aspects: string[];
  };
  preferences: string[];
  options: {
    style?: string[];
    format?: string[];
  };
}

export interface PersonalizationApiResponse {
  status: 'success' | 'error';
  service_type: string;
  recommendations: {
    selectedOptions: string[];
    customPrompt: string;
    userDescription: string;
  };
  reasoning: {
    main_points: string[];
    trait_based: Record<string, string>;
    pattern_based: Record<string, string>;
    additional_notes: Record<string, any>;
  };
  metadata: {
    processed_at: string;
    version: string;
  };
}

export const createPersonalizationRequest = (
  selectedOptions: string[], 
  customPrompt: string
): PersonalizationApiRequest => ({
  context: {
    service_type: "blog",
    request_type: "customize",
    user_id: `user_${Math.random().toString(36).slice(2, 9)}`,
    parameters: {
      content_type: "blog_content",
      target_audience: "custom"
    }
  },
  content: {
    type: "blog_content",
    customization_aspects: ["content_style", "visual_preferences"]
  },
  preferences: [
    ...selectedOptions,
    customPrompt
  ].filter(Boolean),
  options: {
    style: ["default"],
    format: ["markdown"]
  }
});
