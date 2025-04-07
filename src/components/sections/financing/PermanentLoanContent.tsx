
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModelState } from "@/hooks/useModelState";

const PermanentLoanContent = () => {
  const { financing, handleNumberChange, handleSelectChange } = useModelState();
  const {
    permanentLoanAmount,
    setPermanentLoanAmount,
    permanentInterestRate,
    setPermanentInterestRate,
    amortizationYears,
    setAmortizationYears,
    permanentLoanTerm,
    setPermanentLoanTerm,
    permanentLoanFees,
    setPermanentLoanFees,
    prepaymentPenaltyType,
    setPrepaymentPenaltyType,
    interestType,
    setInterestType,
    minimumDscr,
    setMinimumDscr
  } = financing;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div className="space-y-2">
        <Label htmlFor="permanent-loan-amount">Loan Amount ($)</Label>
        <Input 
          id="permanent-loan-amount" 
          placeholder="0" 
          type="number"
          value={permanentLoanAmount}
          onChange={(e) => handleNumberChange(e, setPermanentLoanAmount)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="permanent-interest">Interest Rate (%)</Label>
        <Input 
          id="permanent-interest" 
          placeholder="0" 
          type="number"
          value={permanentInterestRate}
          onChange={(e) => handleNumberChange(e, setPermanentInterestRate)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amortization">Amortization (years)</Label>
        <Input 
          id="amortization" 
          placeholder="0" 
          type="number"
          value={amortizationYears}
          onChange={(e) => handleNumberChange(e, setAmortizationYears)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="permanent-term">Term (years)</Label>
        <Input 
          id="permanent-term" 
          placeholder="0" 
          type="number"
          value={permanentLoanTerm}
          onChange={(e) => handleNumberChange(e, setPermanentLoanTerm)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="permanent-fees">Loan Fees (%)</Label>
        <Input 
          id="permanent-fees" 
          placeholder="0" 
          type="number"
          value={permanentLoanFees}
          onChange={(e) => handleNumberChange(e, setPermanentLoanFees)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prepayment-penalty">Prepayment Penalty</Label>
        <Select 
          value={prepaymentPenaltyType}
          onValueChange={(value) => handleSelectChange(value, setPrepaymentPenaltyType)}
        >
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
        <Select 
          value={interestType}
          onValueChange={(value) => handleSelectChange(value, setInterestType)}
        >
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
        <Input 
          id="min-dscr" 
          placeholder="0" 
          type="number"
          value={minimumDscr}
          onChange={(e) => handleNumberChange(e, setMinimumDscr)}
        />
      </div>
    </div>
  );
};

export default PermanentLoanContent;
