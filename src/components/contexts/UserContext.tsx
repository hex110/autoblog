'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { fetchUserDescription, fetchPersonalizationFromApi } from '@/utils/aiApiConnector';
import { clearPageCache } from '@/utils/pageCache';
import { UserPreferences, ContentPreferences, VisualPreferences, Reasoning } from '@/types/personalization';

interface UserContextProps {
  userDescription: string;
  userHasWishes: boolean;
  isLoading: boolean;
  error: string | null;
  preferences: UserPreferences;
  updateUserWishes: (newOptions: string[], newCustomPrompt: string) => Promise<void>;
  resetPersonalization: () => void;
  fetchPersonalization: () => Promise<void>;
  startPersonalization: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [userDescription, setUserDescription] = useState<string>('');
  const [userHasWishes, setUserHasWishes] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('userPreferences');
      if (savedPrefs) {
        const prefs: UserPreferences = JSON.parse(savedPrefs);
        setPreferences(prefs);
        setUserDescription(prefs.userDescription || '');
        setUserHasWishes(true); // If we have saved preferences, we have wishes
      }
    } catch (error) {
      console.error('Error loading preferences from localStorage:', error);
      resetPersonalization();
    }
  }, []);

  const saveToLocalStorage = (prefs: UserPreferences) => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const resetPersonalization = () => {
    setPreferences({});
    setUserDescription('');
    setUserHasWishes(false);
    setError(null);
    setIsLoading(false);
    
    try {
      localStorage.removeItem('userPreferences');
      clearPageCache();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const fetchPersonalization = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchPersonalizationFromApi(
        preferences.selectedOptions || [], 
        preferences.customPrompt || ''
      );
      
      // Create new preferences object with full API response
      const newPrefs: UserPreferences = {
        // Keep manual preferences
        selectedOptions: preferences.selectedOptions || [],
        customPrompt: preferences.customPrompt || '',
        // Add API response data
        content_preferences: data.recommendations.content_preferences,
        visual_preferences: data.recommendations.visual_preferences,
        reasoning: data.reasoning,
        // Set user description from content style or fallback
        userDescription: data.recommendations.content_preferences?.content_style || 'Customized reader'
      };

      // Update all states
      setPreferences(newPrefs);
      setUserDescription(newPrefs.userDescription || '');
      setUserHasWishes(true);
      
      // Save to localStorage
      saveToLocalStorage(newPrefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch personalization');
      console.error('Error fetching personalization:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserWishes = async (newOptions: string[] = [], newCustomPrompt: string = '') => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchUserDescription(newOptions, newCustomPrompt);
      
      // Create new preferences object
      const newPrefs: UserPreferences = {
        // Keep existing API-provided preferences if they exist
        content_preferences: preferences.content_preferences,
        visual_preferences: preferences.visual_preferences,
        reasoning: preferences.reasoning,
        // Update manual preferences
        selectedOptions: newOptions,
        customPrompt: newCustomPrompt,
        userDescription: response.text || ''
      };

      // Update all states
      setPreferences(newPrefs);
      setUserDescription(newPrefs.userDescription || '');
      setUserHasWishes(true);
      
      // Save to localStorage
      saveToLocalStorage(newPrefs);
    } catch (err) {
      console.error('Error updating user wishes:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const startPersonalization = async () => {
    if (!userHasWishes || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      window.dispatchEvent(new Event('start-personalization'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start personalization');
      console.error('Error starting personalization:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ 
      userDescription,
      userHasWishes,
      isLoading,
      error,
      preferences,
      updateUserWishes,
      resetPersonalization,
      fetchPersonalization,
      startPersonalization
    }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUserContext() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}