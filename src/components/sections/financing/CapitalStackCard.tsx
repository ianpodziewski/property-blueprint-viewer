
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModel } from "@/context/ModelContext";
import { useEffect } from "react";

const CapitalStackCard = () => {
  const { financing, setHasUnsavedChanges } = useModel();

  // Debug logging on mount to verify field values
  useEffect(() => {
    console.log("CapitalStackCard mounted with values:", {
      totalProjectCost: financing.totalProjectCost,
      debtAmount: financing.debtAmount,
      equityAmount: financing.equityAmount,
      loanToCost: financing.loanToCost,
      loanToValue: financing.loanToValue,
      dscr: financing.dscr
    });
  }, [financing]);

  // Consistent handleChange function for all inputs
  const handleInputChange = (field: string, value: string) => {
    // Ensure we have a valid field setter function
    const setterName = `set${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (typeof financing[setterName] === 'function') {
      financing[setterName](value);
      console.log(`Field ${field} updated to:`, value);
      setHasUnsavedChanges(true);
    } else {
      console.error(`No setter found for field: ${field}`);
    }
  };

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
            <Input 
              id="total-project-cost" 
              placeholder="0" 
              type="number" 
              value={financing.totalProjectCost || ""}
              onChange={(e) => {
                financing.setTotalProjectCost(e.target.value);
                setHasUnsavedChanges(true);
                console.log("Total project cost updated:", e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt-amount">Debt Amount ($)</Label>
            <Input 
              id="debt-amount" 
              placeholder="0" 
              type="number"
              value={financing.debtAmount || ""}
              onChange={(e) => {
                financing.setDebtAmount(e.target.value);
                setHasUnsavedChanges(true);
                console.log("Debt amount updated:", e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equity-amount">Equity Amount ($)</Label>
            <Input 
              id="equity-amount" 
              placeholder="0" 
              type="number"
              value={financing.equityAmount || ""}
              onChange={(e) => {
                financing.setEquityAmount(e.target.value);
                setHasUnsavedChanges(true);
                console.log("Equity amount updated:", e.target.value);
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="loan-to-cost">Loan to Cost (%)</Label>
            <Input 
              id="loan-to-cost" 
              placeholder="0" 
              type="number"
              value={financing.loanToCost || ""}
              onChange={(e) => {
                financing.setLoanToCost(e.target.value);
                setHasUnsavedChanges(true);
                console.log("Loan to cost updated:", e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loan-to-value">Loan to Value (%)</Label>
            <Input 
              id="loan-to-value" 
              placeholder="0" 
              type="number"
              value={financing.loanToValue || ""}
              onChange={(e) => {
                financing.setLoanToValue(e.target.value);
                setHasUnsavedChanges(true);
                console.log("Loan to value updated:", e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dscr">Debt Service Coverage Ratio</Label>
            <Input 
              id="dscr" 
              placeholder="0" 
              type="number"
              value={financing.dscr || ""}
              onChange={(e) => {
                financing.setDscr(e.target.value);
                setHasUnsavedChanges(true);
                console.log("DSCR updated:", e.target.value);
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CapitalStackCard;
