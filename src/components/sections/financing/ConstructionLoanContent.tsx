
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModel } from "@/context/ModelContext";

const ConstructionLoanContent = () => {
  const { financing, setHasUnsavedChanges } = useModel();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div className="space-y-2">
        <Label htmlFor="construction-loan-amount">Loan Amount ($)</Label>
        <Input 
          id="construction-loan-amount" 
          placeholder="0" 
          type="number"
          value={financing.constructionLoanAmount || ""} 
          onChange={(e) => {
            financing.setConstructionLoanAmount(e.target.value);
            setHasUnsavedChanges(true);
            console.log("Construction loan amount updated:", e.target.value);
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="construction-interest">Interest Rate (%)</Label>
        <Input 
          id="construction-interest" 
          placeholder="0" 
          type="number"
          value={financing.constructionInterestRate || ""} 
          onChange={(e) => {
            financing.setConstructionInterestRate(e.target.value);
            setHasUnsavedChanges(true);
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="construction-term">Term (months)</Label>
        <Input 
          id="construction-term" 
          placeholder="0" 
          type="number"
          value={financing.constructionTerm || ""} 
          onChange={(e) => {
            financing.setConstructionTerm(e.target.value);
            setHasUnsavedChanges(true);
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="construction-fees">Loan Fees (%)</Label>
        <Input 
          id="construction-fees" 
          placeholder="0" 
          type="number"
          value={financing.constructionLoanFees || ""} 
          onChange={(e) => {
            financing.setConstructionLoanFees(e.target.value);
            setHasUnsavedChanges(true);
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="construction-drawdown">Drawdown Schedule</Label>
        <Select 
          value={financing.constructionDrawdownSchedule || ""}
          onValueChange={(value) => {
            financing.setConstructionDrawdownSchedule(value);
            setHasUnsavedChanges(true);
          }}
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
          value={financing.constructionInterestReserve || ""} 
          onChange={(e) => {
            financing.setConstructionInterestReserve(e.target.value);
            setHasUnsavedChanges(true);
          }}
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="construction-recourse">Recourse</Label>
        <Select 
          value={financing.constructionRecourse || ""}
          onValueChange={(value) => {
            financing.setConstructionRecourse(value);
            setHasUnsavedChanges(true);
          }}
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
