
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdditionalDebtTerms = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div className="space-y-2">
        <Label htmlFor="debt-service-reserve">Debt Service Reserve ($)</Label>
        <Input id="debt-service-reserve" placeholder="0" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reserve-months">Reserve Duration (months)</Label>
        <Input id="reserve-months" placeholder="0" type="number" />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="additional-covenants">Additional Lender Covenants</Label>
        <Input id="additional-covenants" placeholder="Enter any additional covenants" />
      </div>
    </div>
  );
};

export default AdditionalDebtTerms;
