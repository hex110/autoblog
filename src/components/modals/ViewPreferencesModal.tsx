import Modal from './Modal';
import { useUserContext } from '@/components/contexts/UserContext';

interface ViewPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewPreferencesModal({ isOpen, onClose }: ViewPreferencesModalProps) {
  const { preferences } = useUserContext();

  // Format preferences for display
  const formatPreferences = () => {
    const formatted: Record<string, any> = {};

    // Manual preferences
    if (preferences.selectedOptions?.length) {
      formatted.selectedOptions = preferences.selectedOptions;
    }
    if (preferences.customPrompt) {
      formatted.customPrompt = preferences.customPrompt;
    }

    // Content preferences
    if (preferences.content_preferences) {
      formatted.contentPreferences = {
        style: preferences.content_preferences.content_style,
        tone: preferences.content_preferences.tone,
        language: preferences.content_preferences.language,
        emphasis: preferences.content_preferences.emphasis
      };
    }

    // Visual preferences
    if (preferences.visual_preferences) {
      formatted.visualPreferences = {
        emojiUsage: preferences.visual_preferences.emoji_usage,
        spacing: preferences.visual_preferences.spacing,
        layout: preferences.visual_preferences.layout
      };
    }

    // Main points from reasoning
    if (preferences.reasoning?.main_points?.length) {
      formatted.mainPoints = preferences.reasoning.main_points;
    }

    // Additional notes
    if (preferences.reasoning?.additional_notes) {
      formatted.additionalNotes = preferences.reasoning.additional_notes;
    }

    return formatted;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Current Preferences"
    >
      <div className="space-y-4">
        {Object.keys(preferences).length === 0 ? (
          <p className="text-gray-500 text-sm">No preferences set yet. Use the Custom or Automatic buttons to set preferences.</p>
        ) : (
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[60vh] text-sm whitespace-pre-wrap font-mono">
            {JSON.stringify(formatPreferences(), null, 2)}
          </pre>
        )}
      </div>
    </Modal>
  );
} 