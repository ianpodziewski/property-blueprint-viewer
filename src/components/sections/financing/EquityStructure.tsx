
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useModelState } from "@/hooks/useModelState";
import PreferredReturnStructure from "./PreferredReturnStructure";
import PromoteStructure from "./PromoteStructure";
import EquityContributionTiming from "./EquityContributionTiming";
import AdditionalEquityTerms from "./AdditionalEquityTerms";

const EquityStructure = () => {
  const { financing, handlePercentageChange } = useModelState();
  const { 
    generalPartnerPercentage, setGeneralPartnerPercentage,
    limitedPartnerPercentage, setLimitedPartnerPercentage
  } = financing;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equity Structure</CardTitle>
        <CardDescription>Configure equity investment terms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="gp-percentage">GP Percentage (%)</Label>
            <Input 
              id="gp-percentage" 
              placeholder="0" 
              type="number"
              value={generalPartnerPercentage}
              onChange={(e) => handlePercentageChange(e, setGeneralPartnerPercentage)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lp-percentage">LP Percentage (%)</Label>
            <Input 
              id="lp-percentage" 
              placeholder="0" 
              type="number"
              value={limitedPartnerPercentage}
              onChange={(e) => handlePercentageChange(e, setLimitedPartnerPercentage)}
            />
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full" defaultValue="preferred">
          <AccordionItem value="preferred">
            <AccordionTrigger className="text-lg font-semibold">Preferred Return Structure</AccordionTrigger>
            <AccordionContent>
              <PreferredReturnStructure />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Accordion type="single" collapsible className="w-full" defaultValue="promote">
          <AccordionItem value="promote">
            <AccordionTrigger className="text-lg font-semibold">Promote Structure</AccordionTrigger>
            <AccordionContent>
              <PromoteStructure />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Accordion type="single" collapsible className="w-full" defaultValue="funding">
          <AccordionItem value="funding">
            <AccordionTrigger className="text-lg font-semibold">Equity Contribution Timing</AccordionTrigger>
            <AccordionContent>
              <EquityContributionTiming />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="additional-equity">
            <AccordionTrigger>Additional Equity Terms</AccordionTrigger>
            <AccordionContent>
              <AdditionalEquityTerms />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default EquityStructure;
