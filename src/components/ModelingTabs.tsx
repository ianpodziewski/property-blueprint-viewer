
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyBreakdown from "./sections/PropertyBreakdown";
import DevelopmentCosts from "./sections/DevelopmentCosts";
import DevelopmentTimeline from "./sections/DevelopmentTimeline";
import OpExAssumptions from "./sections/OpExAssumptions";
import OpRevAssumptions from "./sections/OpRevAssumptions";
import CapExAssumptions from "./sections/CapExAssumptions";
import Financing from "./sections/Financing";
import Disposition from "./sections/Disposition";
import SensitivityAnalysis from "./sections/SensitivityAnalysis";

const ModelingTabs = () => {
  const [activeTab, setActiveTab] = useState("property");

  return (
    <Tabs defaultValue="property" className="w-full" onValueChange={(value) => setActiveTab(value)}>
      <TabsList className="grid grid-cols-3 md:grid-cols-9 bg-blue-50">
        <TabsTrigger value="property">Property Breakdown</TabsTrigger>
        <TabsTrigger value="devCosts">Development Costs</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="opex">OpEx Assumptions</TabsTrigger>
        <TabsTrigger value="oprev">OpRev Assumptions</TabsTrigger>
        <TabsTrigger value="capex">CapEx Assumptions</TabsTrigger>
        <TabsTrigger value="financing">Financing</TabsTrigger>
        <TabsTrigger value="disposition">Disposition</TabsTrigger>
        <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
      </TabsList>
      
      <div className="mt-6 bg-white rounded-md p-6 border border-gray-200">
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
  );
};

export default ModelingTabs;
