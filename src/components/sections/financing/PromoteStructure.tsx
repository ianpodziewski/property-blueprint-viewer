
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PromoteStructure = () => {
  return (
    <div className="space-y-4 mt-4">
      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-700" />
        <AlertTitle className="text-blue-700 font-medium">Performance-Based Equity Distribution</AlertTitle>
        <AlertDescription className="text-blue-600">
          Define how profits are split after preferred returns are paid, based on project performance tiers.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-6 mt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="font-medium flex items-center text-blue-700">
            IRR Threshold
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-blue-50 border-blue-200 text-blue-700">
                  <p>Internal Rate of Return threshold that triggers different equity splits</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="font-medium flex items-center text-blue-700">
            LP Split (%)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-blue-50 border-blue-200 text-blue-700">
                  <p>Percentage of profits allocated to Limited Partners at this tier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="font-medium flex items-center text-blue-700">
            GP Split (%)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-blue-50 border-blue-200 text-blue-700">
                  <p>Percentage of profits allocated to General Partners at this tier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="tier1" className="text-blue-600">Tier 1 (up to)</Label>
            <Input id="tier1" placeholder="0" type="number" className="border-blue-200 focus:border-blue-400" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier1-lp" className="text-blue-600">LP %</Label>
            <Input id="tier1-lp" placeholder="0" type="number" className="border-blue-200 focus:border-blue-400" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier1-gp" className="text-blue-600">GP %</Label>
            <Input id="tier1-gp" placeholder="0" type="number" className="border-blue-200 focus:border-blue-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="tier2" className="text-blue-600">Tier 2 (up to)</Label>
            <Input id="tier2" placeholder="0" type="number" className="border-blue-200 focus:border-blue-400" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier2-lp" className="text-blue-600">LP %</Label>
            <Input id="tier2-lp" placeholder="0" type="number" className="border-blue-200 focus:border-blue-400" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier2-gp" className="text-blue-600">GP %</Label>
            <Input id="tier2-gp" placeholder="0" type="number" className="border-blue-200 focus:border-blue-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="tier3" className="text-blue-600">Tier 3 (above)</Label>
            <Input id="tier3" placeholder="0" type="number" disabled className="border-blue-200 focus:border-blue-400 bg-blue-50" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier3-lp" className="text-blue-600">LP %</Label>
            <Input id="tier3-lp" placeholder="0" type="number" className="border-blue-200 focus:border-blue-400" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier3-gp" className="text-blue-600">GP %</Label>
            <Input id="tier3-gp" placeholder="0" type="number" className="border-blue-200 focus:border-blue-400" />
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
          Add Tier
        </Button>
      </div>
    </div>
  );
};

export default PromoteStructure;
