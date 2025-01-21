'use client';

import Link from 'next/link';
import { useUserContext } from '../contexts/UserContext';
import { FiSettings, FiRefreshCw, FiCheck, FiLoader, FiEye } from 'react-icons/fi';
import { useState } from 'react';
import PersonalizeModal from '../modals/PersonalizeModal';
import ViewPreferencesModal from '../modals/ViewPreferencesModal';

export default function TopBar() {
  const { 
    userHasWishes, 
    isLoading, 
    fetchPersonalization,
    startPersonalization,
    resetPersonalization 
  } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  return (
    <div className="py-4 bg-gradient-to-r from-green-100 to-teal-200 shadow-sm">
      <div className="px-8 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-xl bg-clip-text text-emerald-800 no-underline">
            Autoblog Documentation
          </Link>
        </div>

        <div className="sm:ml-auto flex items-center gap-2">
          {/* Status indicator */}
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            {isLoading ? (
              <FiLoader className="animate-spin" />
            ) : userHasWishes ? (
              <>
                <FiCheck className="text-emerald-600" />
                <button
                  onClick={() => setIsViewModalOpen(true)}
                  className="text-emerald-600 hover:text-emerald-800"
                  title="View current preferences"
                >
                  <FiEye className="w-4 h-4" />
                </button>
                <button
                  onClick={resetPersonalization}
                  className="text-red-600 hover:text-red-800"
                  title="Reset preferences"
                >
                  Reset
                </button>
              </>
            ) : null}
          </div>

          {/* Main action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-secondary flex items-center gap-1"
              title="Customize preferences manually"
            >
              <FiSettings className="w-4 h-4" />
              Custom
            </button>
            <button
              onClick={fetchPersonalization}
              className="btn-secondary flex items-center gap-1"
              disabled={isLoading}
              title="Get automatic preferences from API"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Automatic
            </button>
            <button
              onClick={startPersonalization}
              className="btn-primary"
              disabled={isLoading || !userHasWishes}
              title={!userHasWishes ? 'Set preferences first using Custom or Automatic' : 'Apply personalization'}
            >
              Personalize!
            </button>
          </div>
        </div>
      </div>

      <PersonalizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <ViewPreferencesModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
}