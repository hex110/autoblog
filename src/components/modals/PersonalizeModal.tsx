import { useEffect, useState } from 'react';
import Modal from './Modal';
import { PRESET_OPTIONS } from '@/types/personalization';
import { useUserContext } from '@/components/contexts/UserContext';


// TODO: Warn before exiting without saving (and if exiting without saving, reset selected options)

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalizeModal({ isOpen, onClose }: PersonalizeModalProps) {
  const { preferences, updateUserWishes, isLoading } = useUserContext();
  const [localSelectedOptions, setLocalSelectedOptions] = useState<string[]>([]);
  const [localCustomPrompt, setLocalCustomPrompt] = useState('');

  // Initialize local state when modal opens or global state changes
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedOptions(preferences.selectedOptions || []);
      setLocalCustomPrompt(preferences.customPrompt || '');
    }
  }, [isOpen, preferences]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCustomPrompt = formData.get('background') as string || '';
    await updateUserWishes(localSelectedOptions, newCustomPrompt);
    onClose();
  };

  const toggleOption = (option: string) => {
    setLocalSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(opt => opt !== option)
        : [...prev, option]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Content"
    >
      <p className="text-sm mb-4 text-emerald-600">
        Select your preferences to help customize the content for you.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`${localSelectedOptions.includes(option)
                ? 'btn-primary text-xs px-2 py-1'
                : 'btn-secondary text-xs px-2 py-1'
                }`}
              disabled={isLoading}
            >
              {option}
            </button>
          ))}
        </div>
        <textarea
          name="background"
          className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
          placeholder="Additional preferences or wishes (e.g. 'translate to Finnish', 'use simple language', 'explain all technical terms')"
          value={localCustomPrompt}
          onChange={(e) => setLocalCustomPrompt(e.target.value)}
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            Save Preferences
          </button>
        </div>
      </form>
    </Modal>
  );
}