
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OpExAssumptions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Operating Expense Assumptions</h2>
        <p className="text-gray-600 mb-6">Define your operating expense projections and assumptions.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>General OpEx Assumptions</CardTitle>
          <CardDescription>Set general operating expense parameters</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="opex-growth">Annual OpEx Growth Rate (%)</Label>
            <Input id="opex-growth" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vacancy-allowance">Vacancy & Credit Loss Allowance (%)</Label>
            <Input id="vacancy-allowance" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fixed Expenses</CardTitle>
          <CardDescription>Regular expenses that don't vary with occupancy</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="property-tax">Property Taxes ($ per year)</Label>
            <Input id="property-tax" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance ($ per year)</Label>
            <Input id="insurance" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="management">Management Fees ($ per year or %)</Label>
            <Input id="management" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin">Administrative ($ per year)</Label>
            <Input id="admin" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Variable Expenses</CardTitle>
          <CardDescription>Expenses that vary with occupancy</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="utilities">Utilities ($ per year)</Label>
            <Input id="utilities" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenance">Repairs & Maintenance ($ per year)</Label>
            <Input id="maintenance" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marketing-exp">Marketing ($ per year)</Label>
            <Input id="marketing-exp" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payroll">Payroll ($ per year)</Label>
            <Input id="payroll" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpExAssumptions;
