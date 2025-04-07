
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdditionalEquityTerms = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div className="space-y-2">
        <Label htmlFor="minimum-investment">Minimum Investment ($)</Label>
        <Input id="minimum-investment" placeholder="0" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="target-multiple">Target Equity Multiple</Label>
        <Input id="target-multiple" placeholder="0" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="target-irr">Target IRR (%)</Label>
        <Input id="target-irr" placeholder="0" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="target-hold">Target Hold Period (years)</Label>
        <Input id="target-hold" placeholder="0" type="number" />
      </div>
    </div>
  );
};

export default AdditionalEquityTerms;
