
import Header from "@/components/Header";
import ModelingTabs from "@/components/ModelingTabs";
import { useEffect } from "react";
import { useModelContext } from "@/state/modelContext";
import { toast } from "@/components/ui/use-toast";
import { isLocalStorageSupported } from "@/utils/localStorage";

const Index = () => {
  const { state } = useModelContext();

  // Show a warning if localStorage is not supported
  useEffect(() => {
    if (!isLocalStorageSupported()) {
      toast({
        title: "Local Storage Not Supported",
        description: "Your browser does not support local storage, which means your data won't be automatically saved. Please use a modern browser for the best experience.",
        variant: "destructive",
      });
    }
  }, []);

  // Show welcome message on first load
  useEffect(() => {
    if (!state.lastSaved) {
      toast({
        title: "Welcome to the Real Estate Modeling Tool",
        description: "Your data will be automatically saved every 30 seconds. You can also click the Save button to save manually.",
      });
    }
  }, [state.lastSaved]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <ModelingTabs />
      </main>
    </div>
  );
};

export default Index;
