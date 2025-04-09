
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import ModelingTabs from "@/components/ModelingTabs";
import { useModel } from "@/context/ModelContext";
import { useProject } from "@/context/ProjectContext";

const Index = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeTab } = useModel();
  const { currentProjectId, setCurrentProjectId } = useProject();
  
  // Make sure projectId from route and context are in sync
  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      console.log("Index: Syncing project ID from URL:", projectId);
      setCurrentProjectId(projectId);
    }
  }, [projectId, currentProjectId, setCurrentProjectId]);
  
  useEffect(() => {
    console.log("Index page mounted, active tab:", activeTab);
    console.log("Current project ID:", projectId || currentProjectId);
  }, [activeTab, projectId, currentProjectId]);
  
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
