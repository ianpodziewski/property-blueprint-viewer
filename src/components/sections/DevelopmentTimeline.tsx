
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const DevelopmentTimeline = () => {
  // Project schedule state
  const [startDate, setStartDate] = useState<Date>();
  const [completionDate, setCompletionDate] = useState<Date>();
  
  // Development periods state
  const [preDevelopmentPeriod, setPreDevelopmentPeriod] = useState("");
  const [leaseUpPeriod, setLeaseUpPeriod] = useState("");
  const [stabilizationPeriod, setStabilizationPeriod] = useState("");
  
  // Construction phases state
  const [constructionPhases, setConstructionPhases] = useState([
    { name: "Phase 1", startDate: undefined as Date | undefined, endDate: undefined as Date | undefined }
  ]);
  
  // Cost timing state
  const [isExpanded, setIsExpanded] = useState(false);
  const [costCategories, setCostCategories] = useState([
    { name: "Land Acquisition", startMonth: "", endMonth: "" },
    { name: "Hard Costs", startMonth: "", endMonth: "" },
    { name: "Soft Costs", startMonth: "", endMonth: "" }
  ]);
  
  // Equity contribution timing state
  const [equityContributionType, setEquityContributionType] = useState("upfront");
  const [equityMilestones, setEquityMilestones] = useState([
    { description: "Initial Investment", date: undefined as Date | undefined, percentage: "25" }
  ]);
  
  // Add new construction phase
  const addConstructionPhase = () => {
    setConstructionPhases([
      ...constructionPhases, 
      { name: `Phase ${constructionPhases.length + 1}`, startDate: undefined, endDate: undefined }
    ]);
  };
  
  // Add new cost category
  const addCostCategory = () => {
    setCostCategories([
      ...costCategories,
      { name: "", startMonth: "", endMonth: "" }
    ]);
  };
  
  // Add new equity milestone
  const addEquityMilestone = () => {
    setEquityMilestones([
      ...equityMilestones,
      { description: "", date: undefined, percentage: "" }
    ]);
  };
  
  // Update construction phase
  const updateConstructionPhase = (index: number, field: string, value: any) => {
    const updatedPhases = [...constructionPhases];
    updatedPhases[index] = { ...updatedPhases[index], [field]: value };
    setConstructionPhases(updatedPhases);
  };
  
  // Update cost category
  const updateCostCategory = (index: number, field: string, value: string) => {
    const updatedCategories = [...costCategories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setCostCategories(updatedCategories);
  };
  
  // Update equity milestone
  const updateEquityMilestone = (index: number, field: string, value: any) => {
    const updatedMilestones = [...equityMilestones];
    updatedMilestones[index] = { ...updatedMilestones[index], [field]: value };
    setEquityMilestones(updatedMilestones);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Development Timeline</h2>
        <p className="text-gray-600 mb-6">Plan your project timeline and phasing.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Schedule</CardTitle>
          <CardDescription>Define key project milestones and durations</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="start-date">Project Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="completion-date">Expected Completion Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !completionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {completionDate ? format(completionDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={completionDate}
                  onSelect={setCompletionDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Development Periods</CardTitle>
          <CardDescription>Define the duration of each development phase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="predevelopment-period">Pre-development Period (months)</Label>
              <Input 
                id="predevelopment-period" 
                placeholder="0" 
                type="number"
                value={preDevelopmentPeriod}
                onChange={(e) => setPreDevelopmentPeriod(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaseup-period">Lease-up Period (months)</Label>
              <Input 
                id="leaseup-period" 
                placeholder="0" 
                type="number"
                value={leaseUpPeriod}
                onChange={(e) => setLeaseUpPeriod(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stabilization-period">Stabilization Period (months)</Label>
              <Input 
                id="stabilization-period" 
                placeholder="0" 
                type="number"
                value={stabilizationPeriod}
                onChange={(e) => setStabilizationPeriod(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">Construction Periods</Label>
              <Button type="button" variant="outline" size="sm" onClick={addConstructionPhase}>
                <Plus className="h-4 w-4 mr-1" /> Add Phase
              </Button>
            </div>
            
            <div className="space-y-4">
              {constructionPhases.map((phase, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor={`phase-name-${index}`}>Phase Name</Label>
                    <Input 
                      id={`phase-name-${index}`} 
                      value={phase.name}
                      onChange={(e) => updateConstructionPhase(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`phase-start-${index}`}>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !phase.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {phase.startDate ? format(phase.startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={phase.startDate}
                          onSelect={(date) => updateConstructionPhase(index, "startDate", date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`phase-end-${index}`}>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !phase.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {phase.endDate ? format(phase.endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={phase.endDate}
                          onSelect={(date) => updateConstructionPhase(index, "endDate", date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Cost Timing</CardTitle>
          <CardDescription>Specify start and end timing for each cost category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {costCategories.map((category, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor={`category-name-${index}`}>Cost Category</Label>
                  <Input 
                    id={`category-name-${index}`} 
                    value={category.name}
                    onChange={(e) => updateCostCategory(index, "name", e.target.value)}
                    placeholder="Category Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`category-start-${index}`}>Start Month</Label>
                  <Input 
                    id={`category-start-${index}`}
                    type="number"
                    placeholder="Month #"
                    value={category.startMonth}
                    onChange={(e) => updateCostCategory(index, "startMonth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`category-end-${index}`}>End Month</Label>
                  <Input 
                    id={`category-end-${index}`}
                    type="number"
                    placeholder="Month #"
                    value={category.endMonth}
                    onChange={(e) => updateCostCategory(index, "endMonth", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addCostCategory} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Add Cost Category
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Equity Contribution Timing</CardTitle>
          <CardDescription>Specify when equity will be contributed to the project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="equity-timing-type">Contribution Type</Label>
            <Select value={equityContributionType} onValueChange={setEquityContributionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select contribution timing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upfront">Upfront (100% at start)</SelectItem>
                <SelectItem value="milestones">At Milestones</SelectItem>
                <SelectItem value="phased">Phased Over Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {equityContributionType === "milestones" && (
            <div className="space-y-4">
              <div className="space-y-4">
                {equityMilestones.map((milestone, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor={`milestone-desc-${index}`}>Milestone Description</Label>
                      <Input 
                        id={`milestone-desc-${index}`}
                        value={milestone.description}
                        onChange={(e) => updateEquityMilestone(index, "description", e.target.value)}
                        placeholder="Milestone Description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`milestone-date-${index}`}>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !milestone.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {milestone.date ? format(milestone.date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={milestone.date}
                            onSelect={(date) => updateEquityMilestone(index, "date", date)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`milestone-percent-${index}`}>Percentage (%)</Label>
                      <Input 
                        id={`milestone-percent-${index}`}
                        type="number"
                        value={milestone.percentage}
                        onChange={(e) => updateEquityMilestone(index, "percentage", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addEquityMilestone} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add Milestone
              </Button>
            </div>
          )}
          
          {equityContributionType === "phased" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phased-start-month">Start Month</Label>
                <Input id="phased-start-month" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phased-end-month">End Month</Label>
                <Input id="phased-end-month" type="number" placeholder="0" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="distribution-pattern">Distribution Pattern</Label>
                <Select defaultValue="even">
                  <SelectTrigger>
                    <SelectValue placeholder="Select distribution pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="even">Even Distribution</SelectItem>
                    <SelectItem value="front-loaded">Front-loaded</SelectItem>
                    <SelectItem value="back-loaded">Back-loaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {equityContributionType === "upfront" && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">
                All equity (100%) will be contributed at the beginning of the project.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopmentTimeline;
