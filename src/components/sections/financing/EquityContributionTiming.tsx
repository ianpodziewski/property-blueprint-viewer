
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModelState } from "@/hooks/useModelState";

const EquityContributionTiming = () => {
  const { financing, handleNumberChange, handleTextChange, handleSelectChange } = useModelState();
  const {
    contributionMethod,
    setContributionMethod,
    initialContributionPercentage,
    setInitialContributionPercentage,
    capitalCallNoticeDays,
    setCapitalCallNoticeDays,
    contributionSchedule,
    addContributionScheduleItem,
    updateContributionScheduleItem
  } = financing;

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="contribution-type">Contribution Method</Label>
        <Select 
          value={contributionMethod}
          onValueChange={(value) => handleSelectChange(value, setContributionMethod)}
        >
          <SelectTrigger id="contribution-type">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upfront">Upfront (100%)</SelectItem>
            <SelectItem value="phased">Phased</SelectItem>
            <SelectItem value="milestone">Milestone-Based</SelectItem>
            <SelectItem value="capital-call">Capital Call</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="space-y-1">
          <Label htmlFor="initial-contribution">Initial Contribution (%)</Label>
          <Input 
            id="initial-contribution" 
            placeholder="0" 
            type="number"
            value={initialContributionPercentage}
            onChange={(e) => handleNumberChange(e, setInitialContributionPercentage, 0, 100)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="capital-call-notice">Capital Call Notice (days)</Label>
          <Input 
            id="capital-call-notice" 
            placeholder="0" 
            type="number"
            value={capitalCallNoticeDays}
            onChange={(e) => handleNumberChange(e, setCapitalCallNoticeDays)}
          />
        </div>
      </div>
      
      <div className="space-y-2 mt-4">
        <Label>Contribution Schedule</Label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="font-medium">Milestone/Date</div>
          <div className="font-medium">Amount ($)</div>
          <div className="font-medium">Percentage</div>
        </div>
        
        {contributionSchedule.map((item) => (
          <div key={item.id} className="grid grid-cols-3 gap-4 mt-1">
            <div className="space-y-1">
              <Input 
                placeholder="E.g., Closing" 
                value={item.milestone}
                onChange={(e) => updateContributionScheduleItem(item.id, "milestone", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Input 
                placeholder="0" 
                type="number"
                value={item.amount}
                onChange={(e) => updateContributionScheduleItem(item.id, "amount", e.target.value)} 
              />
            </div>
            <div className="space-y-1">
              <Input 
                placeholder="0" 
                type="number"
                value={item.percentage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
                    updateContributionScheduleItem(item.id, "percentage", value);
                  }
                }}
              />
            </div>
          </div>
        ))}
        
        <Button variant="outline" size="sm" className="mt-2" onClick={addContributionScheduleItem}>
          Add Contribution
        </Button>
      </div>
    </div>
  );
};

export default EquityContributionTiming;
