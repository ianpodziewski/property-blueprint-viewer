
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useModelNavigation } from '../state/modelContext';
import { toast } from '../components/ui/use-toast';

export const useNavigationState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTab, setActiveTab, dirtyFields, hasDirtyFields } = useModelNavigation();

  // Handle deep linking on initial load
  useEffect(() => {
    // Parse tab from URL hash if present
    if (location.hash) {
      const tabFromHash = location.hash.replace('#', '');
      if (tabFromHash && tabFromHash !== activeTab) {
        setActiveTab(tabFromHash);
      }
    }
  }, []);

  // Update URL hash when tab changes
  useEffect(() => {
    if (activeTab) {
      navigate({ hash: activeTab }, { replace: true });
    }
  }, [activeTab, navigate]);

  // Navigation with dirty state warning
  const navigateWithConfirmation = (newTab: string) => {
    if (hasDirtyFields) {
      // Display a warning toast
      toast({
        title: "Unsaved Changes",
        description: "You have unsaved changes that may be lost. Do you want to continue?",
        variant: "destructive",
        action: (
          <div className="flex gap-2">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setActiveTab(newTab);
              }}
            >
              Continue
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              onClick={() => {}}
            >
              Cancel
            </button>
          </div>
        ),
      });
    } else {
      // No unsaved changes, navigate directly
      setActiveTab(newTab);
    }
  };

  return {
    activeTab,
    navigateWithConfirmation,
    dirtyFields,
    hasDirtyFields
  };
};
