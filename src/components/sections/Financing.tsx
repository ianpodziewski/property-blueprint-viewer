
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Financing = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Financing</h2>
        <p className="text-gray-600 mb-6">Set up your project's debt and equity structure.</p>
      </div>
      
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
      
      <Card>
        <CardHeader>
          <CardTitle>Construction Loan</CardTitle>
          <CardDescription>Configure construction financing terms</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="construction-loan-amount">Loan Amount ($)</Label>
            <Input id="construction-loan-amount" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="construction-interest">Interest Rate (%)</Label>
            <Input id="construction-interest" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="construction-term">Term (months)</Label>
            <Input id="construction-term" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="construction-fees">Loan Fees (%)</Label>
            <Input id="construction-fees" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="construction-drawdown">Drawdown Schedule</Label>
            <Select>
              <SelectTrigger id="construction-drawdown">
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="milestone">Milestone Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="construction-interest-reserve">Interest Reserve ($)</Label>
            <Input id="construction-interest-reserve" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Permanent Financing</CardTitle>
          <CardDescription>Configure permanent loan terms</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Financing;
