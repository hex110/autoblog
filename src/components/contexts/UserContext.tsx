'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { fetchUserDescription, fetchPersonalizationFromApi } from '@/utils/aiApiConnector';

interface UserContextProps {
  customPrompt: string;
  userDescription: string;
  selectedOptions: string[];
  userHasWishes: boolean;
  isLoading: boolean;
  error: string | null;
  updateUserWishes: (newOptions: string[], newCustomPrompt: string) => Promise<void>;
  resetPersonalization: () => void;
  fetchPersonalization: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [userDescription, setUserDescription] = useState<string>('');
  const [userHasWishes, setUserHasWishes] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const options = localStorage.getItem('selectedOptions');
      const prompt = localStorage.getItem('prompt') || '';
      const description = localStorage.getItem('userDescription') || '';
      setSelectedOptions(options ? JSON.parse(options) : []);
      setCustomPrompt(prompt);
      setUserDescription(description);
    } catch (error) {
      console.error('Error loading preferences from localStorage:', error);
      // Reset to defaults if there's an error
      setSelectedOptions([]);
      setCustomPrompt('');
      setUserDescription('');
    }
  }, []);

  // Update userHasWishes when preferences change
  useEffect(() => {
    const hasOptions = Array.isArray(selectedOptions) && selectedOptions.length > 0;
    const hasPrompt = typeof customPrompt === 'string' && customPrompt !== '';
    setUserHasWishes(hasOptions || hasPrompt);
  }, [selectedOptions, customPrompt]);

  const saveToLocalStorage = (options: string[], prompt: string, description: string) => {
    try {
      localStorage.setItem('selectedOptions', JSON.stringify(options));
      localStorage.setItem('prompt', prompt);
      localStorage.setItem('userDescription', description);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const optionsChanged = (newOptions: string[] = [], oldOptions: string[] = []): boolean => {
    return JSON.stringify(newOptions) !== JSON.stringify(oldOptions);
  }

  const resetPersonalization = () => {
    setSelectedOptions([]);
    setCustomPrompt('');
    setUserDescription('');
    setUserHasWishes(false);
    setError(null);
    setIsLoading(false);
    
    try {
      localStorage.removeItem('selectedOptions');
      localStorage.removeItem('prompt');
      localStorage.removeItem('userDescription');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  const fetchPersonalization = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setUserDescription('loading...');

    try {
      const data = await fetchPersonalizationFromApi(selectedOptions, customPrompt);
      const { selectedOptions: newOptions, customPrompt: newPrompt, userDescription: newDescription } = data.recommendations;
      
      // Update all states at once
      setSelectedOptions(newOptions || []);
      setCustomPrompt(newPrompt || '');
      setUserDescription(newDescription || '');
      setUserHasWishes(true); // If we got a response, we definitely have wishes now
      
      // Save everything to localStorage
      saveToLocalStorage(newOptions, newPrompt, newDescription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch personalization');
      console.error('Error fetching personalization:', err);
      setUserDescription('(error)');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserWishes = async (newOptions: string[] = [], newCustomPrompt: string = '') => {
    if (isLoading) return;

    let changed = false;
    if (optionsChanged(newOptions, selectedOptions)) {
      setSelectedOptions(newOptions);
      changed = true;
    }
    if (newCustomPrompt !== customPrompt) {
      setCustomPrompt(newCustomPrompt);
      changed = true;
    }

    if (changed) {
      setIsLoading(true);
      setError(null);
      setUserDescription('loading...');
      
      try {
        const response = await fetchUserDescription(newOptions, newCustomPrompt);
        setUserDescription(response.text || '');
        saveToLocalStorage(newOptions, newCustomPrompt, response.text);
      } catch (err) {
        console.error('Error fetching user description:', err);
        setUserDescription('(error)');
        setError(err instanceof Error ? err.message : 'Failed to fetch user description');
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <UserContext.Provider value={{ 
      customPrompt, 
      userDescription, 
      selectedOptions, 
      userHasWishes, 
      isLoading,
      error,
      updateUserWishes,
      resetPersonalization,
      fetchPersonalization
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