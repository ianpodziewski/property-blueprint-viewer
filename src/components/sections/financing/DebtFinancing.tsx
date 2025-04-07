
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ConstructionLoanContent from "./ConstructionLoanContent";
import PermanentLoanContent from "./PermanentLoanContent";
import AdditionalDebtTerms from "./AdditionalDebtTerms";

interface DebtFinancingProps {
  loanType: "construction" | "permanent" | "both";
  setLoanType: (value: "construction" | "permanent" | "both") => void;
}

const DebtFinancing = ({ loanType, setLoanType }: DebtFinancingProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Financing</CardTitle>
        <CardDescription>Configure your debt structure</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Loan Type</Label>
          <RadioGroup defaultValue="both" className="flex space-x-4" onValueChange={(value) => setLoanType(value as "construction" | "permanent" | "both")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="construction" id="construction" />
              <Label htmlFor="construction">Construction Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="permanent" id="permanent" />
              <Label htmlFor="permanent">Permanent Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both">Construction to Permanent</Label>
            </div>
          </RadioGroup>
        </div>
        
        {(loanType === "construction" || loanType === "both") && (
          <Accordion type="single" collapsible className="w-full" defaultValue="construction">
            <AccordionItem value="construction">
              <AccordionTrigger className="text-lg font-semibold">Construction Loan</AccordionTrigger>
              <AccordionContent>
                <ConstructionLoanContent />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {(loanType === "permanent" || loanType === "both") && (
          <Accordion type="single" collapsible className="w-full" defaultValue="permanent">
            <AccordionItem value="permanent">
              <AccordionTrigger className="text-lg font-semibold">Permanent Financing</AccordionTrigger>
              <AccordionContent>
                <PermanentLoanContent />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="additional">
            <AccordionTrigger>Additional Debt Terms</AccordionTrigger>
            <AccordionContent>
              <AdditionalDebtTerms />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default DebtFinancing;
