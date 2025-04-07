
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DevelopmentTimeline = () => {
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
            <Input id="start-date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="completion-date">Expected Completion Date</Label>
            <Input id="completion-date" type="date" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Development Phases</CardTitle>
          <CardDescription>Break down your project into phases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Pre-Development</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="predevelopment-start">Start Date</Label>
                <Input id="predevelopment-start" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="predevelopment-end">End Date</Label>
                <Input id="predevelopment-end" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="predevelopment-duration">Duration (months)</Label>
                <Input id="predevelopment-duration" placeholder="0" type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Construction</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="construction-start">Start Date</Label>
                <Input id="construction-start" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="construction-end">End Date</Label>
                <Input id="construction-end" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="construction-duration">Duration (months)</Label>
                <Input id="construction-duration" placeholder="0" type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Lease-Up / Sales</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leaseup-start">Start Date</Label>
                <Input id="leaseup-start" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseup-end">End Date</Label>
                <Input id="leaseup-end" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseup-duration">Duration (months)</Label>
                <Input id="leaseup-duration" placeholder="0" type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Stabilized Operations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stabilized-start">Start Date</Label>
                <Input id="stabilized-start" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stabilized-end">End Date</Label>
                <Input id="stabilized-end" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stabilized-duration">Duration (months)</Label>
                <Input id="stabilized-duration" placeholder="0" type="number" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopmentTimeline;
