'use client'

import { BiRefresh } from 'react-icons/bi';
import { AiDisclaimer } from './AiDisclaimer';
import { PostMarkdown } from './PostMarkdown';
import { getCachedPage } from '@/utils/pageCache';
import { useEffect } from 'react';
import { cachePage } from '@/utils/pageCache';
import { useState } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { CachedPage } from '@/utils/pageCache';
import { fetchModifiedMarkdown } from '@/utils/aiApiConnector';

interface PersonalizedPostProps {
  markdown: string;
  slug: string;
}

export function PersonalizedPost({ markdown, slug }: PersonalizedPostProps) {
  const [modifiedContent, setModifiedContent] = useState('');
  const { preferences, userHasWishes } = useUserContext();
  const [cachedPage, setCachedPage] = useState<CachedPage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false);

  // Create a stable cache key from preferences
  const createCacheKey = () => {
    const parts = [
      slug,
      preferences.content_preferences?.content_style,
      preferences.content_preferences?.tone,
      preferences.visual_preferences?.emoji_usage,
      preferences.visual_preferences?.spacing,
      preferences.selectedOptions?.join('_'),
      preferences.customPrompt
    ].filter(Boolean);
    return parts.join('_');
  };

  const generatePersonalizedContent = () => {
    if (!userHasWishes) return;
    
    setIsGenerating(true);
    const cacheKey = createCacheKey();
    fetchModifiedMarkdown(markdown, preferences)
      .then(response => {
        const newCachedPage = cachePage(cacheKey, response.text);
        setCachedPage(newCachedPage);
        setModifiedContent(response.text);
      })
      .catch(error => {
        console.error('Error fetching modified markdown:', error);
        setCachedPage(null);
        setModifiedContent('Error fetching personalized version');
      })
      .finally(() => {
        setIsGenerating(false);
        setShouldGenerate(false);
      });
  }

  // Check cache when preferences change
  useEffect(() => {
    if (slug && markdown && userHasWishes) {
      const cacheKey = createCacheKey();
      const cached = getCachedPage(cacheKey);

      if (cached) {
        setCachedPage(cached);
        setModifiedContent(cached.content);
      } else if (shouldGenerate) {
        generatePersonalizedContent();
      }
    } else {
      setCachedPage(null);
      setModifiedContent('');
    }
  }, [markdown, preferences, slug, shouldGenerate, userHasWishes]);

  // Listen for personalization requests
  useEffect(() => {
    const handlePersonalization = () => {
      setShouldGenerate(true);
    };

    window.addEventListener('start-personalization', handlePersonalization);
    return () => window.removeEventListener('start-personalization', handlePersonalization);
  }, []);

  return (
    <>
      <AiDisclaimer />
      <div className="text-sm text-gray-500 flex items-center gap-2 mt-6 h-6">
        {cachedPage && (
          <>
            <span>
              Generated on {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              }).format(new Date(cachedPage.timestamp))}
            </span>
            <button
              onClick={() => setShouldGenerate(true)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Regenerate content"
              disabled={isGenerating}
            >
              <BiRefresh className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      {isGenerating ? (
        <div className="text-center text-gray-500 mt-12">
          <span>Generating personalized version...</span>
        </div>
      ) : modifiedContent ? (
        <PostMarkdown markdownContent={modifiedContent} isModified={true} />
      ) : (
        <PostMarkdown markdownContent={markdown} isModified={false} />
      )}
    </>
  )
}