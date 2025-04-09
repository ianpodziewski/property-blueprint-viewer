
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useModelNavigation } from '../state/modelContext';
import { toast } from '../components/ui/use-toast';
import { Button } from '@/components/ui/button';

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
  }, [location.hash, activeTab, setActiveTab]);

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
            <Button
              variant="destructive"
              onClick={() => {
                setActiveTab(newTab);
              }}
            >
              Continue
            </Button>
            <Button
              variant="outline"
              onClick={() => {}}
            >
              Cancel
            </Button>
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
