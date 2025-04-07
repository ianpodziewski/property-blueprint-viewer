
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, Trash2 } from "lucide-react";

type CostMetric = "psf" | "per_unit" | "percentage" | "lump_sum";

interface ExpenseItem {
  id: string;
  name: string;
  cost: string;
  metric: CostMetric;
}

const OpExAssumptions = () => {
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
    { id: "1", name: "Property Management", cost: "", metric: "percentage" },
    { id: "2", name: "Utilities", cost: "", metric: "psf" },
    { id: "3", name: "Repairs & Maintenance", cost: "", metric: "psf" },
    { id: "4", name: "Marketing", cost: "", metric: "lump_sum" },
    { id: "5", name: "Payroll", cost: "", metric: "lump_sum" }
  ]);

  const [customExpenses, setCustomExpenses] = useState<ExpenseItem[]>([]);

  const addCustomExpense = () => {
    const newExpense = {
      id: `custom-${Date.now()}`,
      name: "",
      cost: "",
      metric: "lump_sum" as CostMetric
    };
    setCustomExpenses([...customExpenses, newExpense]);
  };

  const removeCustomExpense = (id: string) => {
    setCustomExpenses(customExpenses.filter(expense => expense.id !== id));
  };

  const updateCustomExpense = (id: string, field: keyof ExpenseItem, value: string) => {
    setCustomExpenses(
      customExpenses.map(expense => 
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  const updateExpenseItem = (id: string, field: keyof ExpenseItem, value: string) => {
    setExpenseItems(
      expenseItems.map(expense => 
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  const metricLabels: Record<CostMetric, string> = {
    psf: "$ per sq ft",
    per_unit: "$ per unit",
    percentage: "% of revenue",
    lump_sum: "$ lump sum"
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Operating Expense Assumptions</h2>
        <p className="text-gray-600 mb-6">Define your operating expense projections and assumptions.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>General OpEx Parameters</CardTitle>
          <CardDescription>Set overall operating expense parameters</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="opex-growth">Annual OpEx Growth Rate (%)</Label>
            <Input id="opex-growth" placeholder="0" type="number" min="0" step="0.1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vacancy-allowance">Vacancy & Credit Loss Allowance (%)</Label>
            <Input id="vacancy-allowance" placeholder="0" type="number" min="0" max="100" step="0.1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escalation Rates</CardTitle>
          <CardDescription>Annual increase percentages for expense categories</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tax-escalation">Property Tax Escalation (%/year)</Label>
            <Input id="tax-escalation" placeholder="0" type="number" min="0" step="0.1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance-escalation">Insurance Escalation (%/year)</Label>
            <Input id="insurance-escalation" placeholder="0" type="number" min="0" step="0.1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utility-escalation">Utilities Escalation (%/year)</Label>
            <Input id="utility-escalation" placeholder="0" type="number" min="0" step="0.1" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Standard Operating Expenses</CardTitle>
          <CardDescription>Regular recurring property expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {expenseItems.map((expense) => (
            <div key={expense.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`expense-name-${expense.id}`}>{expense.name}</Label>
                <Input 
                  id={`expense-cost-${expense.id}`}
                  value={expense.cost}
                  onChange={(e) => updateExpenseItem(expense.id, 'cost', e.target.value)}
                  placeholder="0" 
                  type="number" 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`expense-metric-${expense.id}`}>Cost Metric</Label>
                <Select 
                  value={expense.metric}
                  onValueChange={(value) => updateExpenseItem(expense.id, 'metric', value as CostMetric)}
                >
                  <SelectTrigger id={`expense-metric-${expense.id}`}>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(metricLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-4">Custom Expenses</p>

            {customExpenses.map((expense) => (
              <div key={expense.id} className="grid grid-cols-1 md:grid-cols-9 gap-4 items-end mb-4">
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor={`custom-name-${expense.id}`}>Name</Label>
                  <Input 
                    id={`custom-name-${expense.id}`}
                    value={expense.name}
                    onChange={(e) => updateCustomExpense(expense.id, 'name', e.target.value)}
                    placeholder="Expense name" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`custom-cost-${expense.id}`}>Cost</Label>
                  <Input 
                    id={`custom-cost-${expense.id}`}
                    value={expense.cost}
                    onChange={(e) => updateCustomExpense(expense.id, 'cost', e.target.value)}
                    placeholder="0" 
                    type="number" 
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor={`custom-metric-${expense.id}`}>Cost Metric</Label>
                  <Select 
                    value={expense.metric}
                    onValueChange={(value) => updateCustomExpense(expense.id, 'metric', value as CostMetric)}
                  >
                    <SelectTrigger id={`custom-metric-${expense.id}`}>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(metricLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1 flex justify-end items-end">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeCustomExpense(expense.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={addCustomExpense}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Custom Expense
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Property Taxes & Insurance</CardTitle>
          <CardDescription>Annual tax and insurance costs</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="property-tax">Property Taxes</Label>
            <Input id="property-tax" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-metric">Tax Calculation Method</Label>
            <Select defaultValue="lump_sum">
              <SelectTrigger id="tax-metric">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lump_sum">Annual Amount ($)</SelectItem>
                <SelectItem value="percentage">% of Property Value</SelectItem>
                <SelectItem value="psf">$ per Square Foot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance</Label>
            <Input id="insurance" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance-metric">Insurance Calculation Method</Label>
            <Select defaultValue="lump_sum">
              <SelectTrigger id="insurance-metric">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lump_sum">Annual Amount ($)</SelectItem>
                <SelectItem value="psf">$ per Square Foot</SelectItem>
                <SelectItem value="per_unit">$ per Unit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lease-Type Variability</CardTitle>
          <CardDescription>Expense allocation based on lease structure</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="triple-net">
              <AccordionTrigger className="text-base">Triple Net (NNN) Lease</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="nnn-tenant-pays">Tenant Responsible For:</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="nnn-taxes" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="nnn-taxes" className="font-normal">Property Taxes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="nnn-insurance" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="nnn-insurance" className="font-normal">Insurance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="nnn-cam" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="nnn-cam" className="font-normal">CAM</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="nnn-utilities" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="nnn-utilities" className="font-normal">Utilities</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nnn-landlord-pays">Landlord Responsible For:</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="nnn-structure" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="nnn-structure" className="font-normal">Structure</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="nnn-roof" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="nnn-roof" className="font-normal">Roof</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="modified-gross">
              <AccordionTrigger className="text-base">Modified Gross Lease</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="mg-tenant-pays">Tenant Responsible For:</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="mg-utilities" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="mg-utilities" className="font-normal">Utilities</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="mg-janitorial" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="mg-janitorial" className="font-normal">Janitorial</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mg-landlord-pays">Landlord Responsible For:</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="mg-taxes" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="mg-taxes" className="font-normal">Property Taxes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="mg-insurance" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="mg-insurance" className="font-normal">Insurance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="mg-cam" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="mg-cam" className="font-normal">CAM</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="mg-maintenance" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="mg-maintenance" className="font-normal">Maintenance</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="full-service">
              <AccordionTrigger className="text-base">Full Service Gross Lease</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fs-tenant-pays">Tenant Responsible For:</Label>
                    <p className="text-gray-600 text-sm">None - All expenses covered by landlord</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fs-landlord-pays">Landlord Responsible For:</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="fs-all" className="rounded border-gray-300" defaultChecked disabled />
                        <Label htmlFor="fs-all" className="font-normal">All Operating Expenses</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="custom">
              <AccordionTrigger className="text-base">Custom Lease Type</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-description">Describe Expense Allocation:</Label>
                    <textarea 
                      id="custom-description" 
                      rows={4} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Describe which expenses are paid by tenant vs. landlord"
                    ></textarea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpExAssumptions;
