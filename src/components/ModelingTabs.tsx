
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useModel } from "@/context/ModelContext";
import MainNavigation from "./MainNavigation";
import NavigationControls from "./NavigationControls";
import PropertyBreakdown from "./sections/PropertyBreakdown";
import DevelopmentCosts from "./sections/DevelopmentCosts";
import DevelopmentTimeline from "./sections/DevelopmentTimeline";
import OpExAssumptions from "./sections/OpExAssumptions";
import OpRevAssumptions from "./sections/OpRevAssumptions";
import CapExAssumptions from "./sections/CapExAssumptions";
import Financing from "./sections/Financing";
import Disposition from "./sections/Disposition";
import SensitivityAnalysis from "./sections/SensitivityAnalysis";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const ModelingTabs = () => {
  // Add local state as a fallback in case context isn't available right away
  const [localActiveTab, setLocalActiveTab] = useState("property");
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  try {
    // Get context values
    const { activeTab, isLoading, error } = useModel();
    
    // Log successful context access
    useEffect(() => {
      console.log("ModelingTabs: Successfully connected to ModelContext, active tab:", activeTab);
    }, [activeTab]);
    
    if (isLoading) {
      return (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">Loading your model</h3>
          <p className="text-gray-500">Please wait while we load your project data...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="w-full p-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle className="text-lg mb-2">Error Loading Model</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Reload Page
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    return (
      <div className="w-full space-y-4">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <MainNavigation />
            <div className="pr-4">
              <NavigationControls />
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} className="w-full">
          <div className="mt-4 bg-white rounded-md p-6 border border-gray-200">
            <TabsContent value="property" className="space-y-4">
              <PropertyBreakdown />
            </TabsContent>
            
            <TabsContent value="devCosts" className="space-y-4">
              <DevelopmentCosts />
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4">
              <DevelopmentTimeline />
            </TabsContent>
            
            <TabsContent value="opex" className="space-y-4">
              <OpExAssumptions />
            </TabsContent>
            
            <TabsContent value="oprev" className="space-y-4">
              <OpRevAssumptions />
            </TabsContent>
            
            <TabsContent value="capex" className="space-y-4">
              <CapExAssumptions />
            </TabsContent>
            
            <TabsContent value="financing" className="space-y-4">
              <Financing />
            </TabsContent>
            
            <TabsContent value="disposition" className="space-y-4">
              <Disposition />
            </TabsContent>
            
            <TabsContent value="sensitivity" className="space-y-4">
              <SensitivityAnalysis />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  } catch (error) {
    // If there was an error accessing the context or rendering the component
    const err = error as Error;
    
    if (!loadError) {
      setLoadError(err);
      console.error("Error in ModelingTabs:", err);
    }
    
    return (
      <div className="w-full p-6 text-center">
        <div className="bg-red-50 border border-red-300 rounded-lg p-6 mx-auto max-w-2xl">
          <h3 className="text-red-700 text-xl font-semibold mb-4">Error loading modeling tabs</h3>
          <p className="text-red-600 mb-4">
            There was a problem loading the application. This may be due to an issue with the context provider setup.
          </p>
          <div className="bg-gray-100 p-4 rounded text-left overflow-x-auto text-sm mb-4">
            <code>
              {err ? err.message : "Unknown error"}
            </code>
          </div>
          <Button 
            variant="destructive" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }
};

export default ModelingTabs;
