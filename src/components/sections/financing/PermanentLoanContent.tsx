
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PermanentLoanContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div className="space-y-2">
        <Label htmlFor="permanent-loan-amount">Loan Amount ($)</Label>
        <Input id="permanent-loan-amount" placeholder="0" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="permanent-interest">Interest Rate (%)</Label>
        <Input id="permanent-interest" placeholder="0" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amortization">Amortization (years)</Label>
        <Input id="amortization" placeholder="0" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="permanent-term">Term (years)</Label>
        <Input id="permanent-term" placeholder="0" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="permanent-fees">Loan Fees (%)</Label>
        <Input id="permanent-fees" placeholder="0" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prepayment-penalty">Prepayment Penalty</Label>
        <Select>
          <SelectTrigger id="prepayment-penalty">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="yield-maintenance">Yield Maintenance</SelectItem>
            <SelectItem value="stepdown">Step Down</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="interest-type">Interest Type</Label>
        <Select>
          <SelectTrigger id="interest-type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="variable">Variable</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="min-dscr">Minimum DSCR Covenant</Label>
        <Input id="min-dscr" placeholder="0" type="number" />
      </div>
    </div>
  );
};

export default PermanentLoanContent;
