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
  updateUserWishes: (newOptions: string[], newCustomPrompt: string) => void;
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

  useEffect(() => {
    const options = localStorage.getItem('selectedOptions') || '[]';
    const prompt = localStorage.getItem('prompt') || '';
    const description = localStorage.getItem('userDescription') || '';
    setSelectedOptions(JSON.parse(options));
    setCustomPrompt(prompt);
    setUserDescription(description);
  }, []);

  useEffect(() => {
    setUserHasWishes(selectedOptions.length > 0 || customPrompt !== '');
  }, [selectedOptions, customPrompt]);

  const optionsChanged = (newOptions: string[], oldOptions: string[]): boolean => {
    const changed = JSON.stringify(newOptions) !== JSON.stringify(oldOptions);
    return changed;
  }

  const resetPersonalization = () => {
    setSelectedOptions([]);
    setCustomPrompt('');
    setUserDescription('');
    setUserHasWishes(false);
    setError(null);
    
    localStorage.removeItem('selectedOptions');
    localStorage.removeItem('prompt');
    localStorage.removeItem('userDescription');
  };

  const fetchPersonalization = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchPersonalizationFromApi(selectedOptions, customPrompt);
      const { selectedOptions: newOptions, customPrompt: newPrompt, userDescription: newDescription } = data.recommendations;
      
      setSelectedOptions(newOptions);
      setCustomPrompt(newPrompt);
      setUserDescription(newDescription);
      setUserHasWishes(newOptions.length > 0 || newPrompt !== '');

      // Update localStorage
      localStorage.setItem('selectedOptions', JSON.stringify(newOptions));
      localStorage.setItem('prompt', newPrompt);
      localStorage.setItem('userDescription', newDescription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch personalization');
      console.error('Error fetching personalization:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserWishes = async (newOptions: string[], newCustomPrompt: string) => {
    if (isLoading) return;

    let changed = false;
    if (optionsChanged(newOptions, selectedOptions)) {
      setSelectedOptions(newOptions);
      localStorage.setItem('selectedOptions', JSON.stringify(newOptions));
      changed = true;
    }
    if (newCustomPrompt !== customPrompt) {
      setCustomPrompt(newCustomPrompt);
      localStorage.setItem('prompt', newCustomPrompt);
      changed = true;
    }

    if (changed) {
      if (newOptions.length > 0 || newCustomPrompt) {
        setIsLoading(true);
        setError(null);
        setUserDescription('loading...');
        
        try {
          const response = await fetchUserDescription(newOptions, newCustomPrompt);
          setUserDescription(response.text);
          localStorage.setItem('userDescription', response.text);
        } catch (err) {
          console.error('Error fetching user description:', err);
          setUserDescription('(error)');
          setError(err instanceof Error ? err.message : 'Failed to fetch user description');
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserDescription('');
        localStorage.removeItem('userDescription');
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