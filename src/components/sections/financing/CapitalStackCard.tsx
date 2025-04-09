
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CapitalStackCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capital Stack</CardTitle>
        <CardDescription>Define your project's capital structure</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="total-project-cost">Total Project Cost ($)</Label>
            <Input id="total-project-cost" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt-amount">Debt Amount ($)</Label>
            <Input id="debt-amount" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equity-amount">Equity Amount ($)</Label>
            <Input id="equity-amount" placeholder="0" type="number" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="loan-to-cost">Loan to Cost (%)</Label>
            <Input id="loan-to-cost" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loan-to-value">Loan to Value (%)</Label>
            <Input id="loan-to-value" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dscr">Debt Service Coverage Ratio</Label>
            <Input id="dscr" placeholder="0" type="number" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CapitalStackCard;
