
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModelState } from "@/hooks/useModelState";

const PreferredReturnStructure = () => {
  const { financing, handleNumberChange, handleSelectChange } = useModelState();
  const {
    preferredReturnRate: preferredReturn,
    setPreferredReturnRate: setPreferredReturn,
    preferredStructureType: preferredStructure,
    setPreferredStructureType: setPreferredStructure,
    gpCatchupPercentage: gpCatchup,
    setGpCatchupPercentage: setGpCatchup,
    preferredPaymentFrequency: paymentFrequency,
    setPreferredPaymentFrequency: setPaymentFrequency
  } = financing;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div className="space-y-2">
        <Label htmlFor="pref-return">Preferred Return (%)</Label>
        <Input 
          id="pref-return" 
          placeholder="0" 
          type="number" 
          value={preferredReturn}
          onChange={(e) => handleNumberChange(e, setPreferredReturn)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pref-structure">Structure</Label>
        <Select
          value={preferredStructure}
          onValueChange={(value) => handleSelectChange(value, setPreferredStructure)}
        >
          <SelectTrigger id="pref-structure">
            <SelectValue placeholder="Select structure" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cumulative">Cumulative</SelectItem>
            <SelectItem value="non-cumulative">Non-Cumulative</SelectItem>
            <SelectItem value="compounding">Compounding</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="catchup">GP Catch-up (%)</Label>
        <Input 
          id="catchup" 
          placeholder="0" 
          type="number"
          value={gpCatchup}
          onChange={(e) => handleNumberChange(e, setGpCatchup)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="payment-frequency">Payment Frequency</Label>
        <Select
          value={paymentFrequency}
          onValueChange={(value) => handleSelectChange(value, setPaymentFrequency)}
        >
          <SelectTrigger id="payment-frequency">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="exit">At Exit</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PreferredReturnStructure;
