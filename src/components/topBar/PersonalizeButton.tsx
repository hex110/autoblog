'use client';

import { useState } from 'react';
import { useUserContext } from '@/components/contexts/UserContext';
import PersonalizeModal from '@/components/modals/PersonalizeModal';

export default function PersonalizeButton() {
  const { userDescription, isLoading, error, resetPersonalization, fetchPersonalization } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center space-x-2">
        {userDescription ? (
          <>
            <span className="text-sm text-emerald-800 whitespace-nowrap">Viewing as:</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-emerald-200 transition-colors hover:border-emerald-400 max-w-[200px] truncate"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : userDescription}
            </button>
            <button
              onClick={resetPersonalization}
              className="text-red-600 hover:text-red-800 text-sm"
              disabled={isLoading}
            >
              Reset
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
              disabled={isLoading}
            >
              Personalize!
            </button>
            <button
              onClick={fetchPersonalization}
              className="btn-secondary"
              disabled={isLoading}
            >
              Load from API
            </button>
          </>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      <PersonalizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}