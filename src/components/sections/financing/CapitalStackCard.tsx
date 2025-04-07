
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModelState } from "@/hooks/useModelState";
import ExportDataButton from "@/components/ExportDataButton";

const CapitalStackCard = () => {
  const { financing, handleNumberChange } = useModelState();
  const {
    totalProjectCost,
    setTotalProjectCost,
    debtAmount,
    setDebtAmount,
    equityAmount,
    setEquityAmount,
    loanToCostRatio,
    setLoanToCostRatio,
    loanToValueRatio,
    setLoanToValueRatio,
    debtServiceCoverageRatio,
    setDebtServiceCoverageRatio
  } = financing;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Capital Stack</CardTitle>
          <CardDescription>Define your project's capital structure</CardDescription>
        </div>
        <div className="flex space-x-2">
          <ExportDataButton format="csv" />
          <ExportDataButton format="json" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="total-project-cost">Total Project Cost ($)</Label>
            <Input 
              id="total-project-cost" 
              placeholder="0" 
              type="number"
              value={totalProjectCost}
              onChange={(e) => handleNumberChange(e, setTotalProjectCost)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt-amount">Debt Amount ($)</Label>
            <Input 
              id="debt-amount" 
              placeholder="0" 
              type="number"
              value={debtAmount}
              onChange={(e) => handleNumberChange(e, setDebtAmount)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equity-amount">Equity Amount ($)</Label>
            <Input 
              id="equity-amount" 
              placeholder="0" 
              type="number"
              value={equityAmount}
              onChange={(e) => handleNumberChange(e, setEquityAmount)}
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
              value={loanToCostRatio}
              onChange={(e) => handleNumberChange(e, setLoanToCostRatio, 0, 100)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loan-to-value">Loan to Value (%)</Label>
            <Input 
              id="loan-to-value" 
              placeholder="0" 
              type="number"
              value={loanToValueRatio}
              onChange={(e) => handleNumberChange(e, setLoanToValueRatio, 0, 100)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dscr">Debt Service Coverage Ratio</Label>
            <Input 
              id="dscr" 
              placeholder="0" 
              type="number"
              value={debtServiceCoverageRatio}
              onChange={(e) => handleNumberChange(e, setDebtServiceCoverageRatio)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CapitalStackCard;
