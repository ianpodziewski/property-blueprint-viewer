
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModelState } from "@/hooks/useModelState";

const ConstructionLoanContent = () => {
  const { financing, handleNumberChange, handleSelectChange } = useModelState();
  const {
    constructionLoanAmount,
    setConstructionLoanAmount,
    constructionInterestRate,
    setConstructionInterestRate,
    constructionLoanTerm,
    setConstructionLoanTerm,
    constructionLoanFees,
    setConstructionLoanFees,
    constructionDrawdownSchedule,
    setConstructionDrawdownSchedule,
    constructionInterestReserve,
    setConstructionInterestReserve,
    constructionRecourseType,
    setConstructionRecourseType
  } = financing;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div className="space-y-2">
        <Label htmlFor="construction-loan-amount">Loan Amount ($)</Label>
        <Input 
          id="construction-loan-amount" 
          placeholder="0" 
          type="number"
          value={constructionLoanAmount}
          onChange={(e) => handleNumberChange(e, setConstructionLoanAmount)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="construction-interest">Interest Rate (%)</Label>
        <Input 
          id="construction-interest" 
          placeholder="0" 
          type="number"
          value={constructionInterestRate}
          onChange={(e) => handleNumberChange(e, setConstructionInterestRate)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="construction-term">Term (months)</Label>
        <Input 
          id="construction-term" 
          placeholder="0" 
          type="number"
          value={constructionLoanTerm}
          onChange={(e) => handleNumberChange(e, setConstructionLoanTerm)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="construction-fees">Loan Fees (%)</Label>
        <Input 
          id="construction-fees" 
          placeholder="0" 
          type="number"
          value={constructionLoanFees}
          onChange={(e) => handleNumberChange(e, setConstructionLoanFees)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="construction-drawdown">Drawdown Schedule</Label>
        <Select 
          value={constructionDrawdownSchedule}
          onValueChange={(value) => handleSelectChange(value, setConstructionDrawdownSchedule)}
        >
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
        <Input 
          id="construction-interest-reserve" 
          placeholder="0" 
          type="number"
          value={constructionInterestReserve}
          onChange={(e) => handleNumberChange(e, setConstructionInterestReserve)}
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="construction-recourse">Recourse</Label>
        <Select 
          value={constructionRecourseType}
          onValueChange={(value) => handleSelectChange(value, setConstructionRecourseType)}
        >
          <SelectTrigger id="construction-recourse">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Recourse</SelectItem>
            <SelectItem value="partial">Partial Recourse</SelectItem>
            <SelectItem value="non">Non-Recourse</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ConstructionLoanContent;
