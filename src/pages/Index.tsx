
import { useEffect } from "react";
import Header from "@/components/Header";
import ModelingTabs from "@/components/ModelingTabs";
import { useModel } from "@/context/ModelContext";

const Index = () => {
  // Access the model context to verify it's available at this level
  const { activeTab } = useModel();
  
  useEffect(() => {
    console.log("Index page mounted, active tab from context:", activeTab);
  }, [activeTab]);
  
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
