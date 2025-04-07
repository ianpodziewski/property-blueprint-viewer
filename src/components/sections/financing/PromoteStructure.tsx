
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const PromoteStructure = () => {
  return (
    <div className="space-y-4 mt-4">
      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Performance-Based Equity Distribution</AlertTitle>
        <AlertDescription>
          Define how profits are split after preferred returns are paid, based on project performance tiers.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-6 mt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="font-medium">IRR Threshold</div>
          <div className="font-medium">LP Split (%)</div>
          <div className="font-medium">GP Split (%)</div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="tier1">Tier 1 (up to)</Label>
            <Input id="tier1" placeholder="0" type="number" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier1-lp">LP %</Label>
            <Input id="tier1-lp" placeholder="0" type="number" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier1-gp">GP %</Label>
            <Input id="tier1-gp" placeholder="0" type="number" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="tier2">Tier 2 (up to)</Label>
            <Input id="tier2" placeholder="0" type="number" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier2-lp">LP %</Label>
            <Input id="tier2-lp" placeholder="0" type="number" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier2-gp">GP %</Label>
            <Input id="tier2-gp" placeholder="0" type="number" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="tier3">Tier 3 (above)</Label>
            <Input id="tier3" placeholder="0" type="number" disabled />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier3-lp">LP %</Label>
            <Input id="tier3-lp" placeholder="0" type="number" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tier3-gp">GP %</Label>
            <Input id="tier3-gp" placeholder="0" type="number" />
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="mt-2">
          Add Tier
        </Button>
      </div>
    </div>
  );
};

export default PromoteStructure;
