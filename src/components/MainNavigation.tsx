
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BookOpen, BarChart3, Building2, CalendarDays, DollarSign, FileText, LineChart, Percent, Workflow } from "lucide-react";

const sections = [
  {
    title: "Property",
    icon: <Building2 className="mr-2 h-4 w-4" />,
    description: "Property characteristics and breakdown",
    value: "property"
  },
  {
    title: "Development Costs",
    icon: <DollarSign className="mr-2 h-4 w-4" />,
    description: "Hard and soft development costs",
    value: "devCosts"
  },
  {
    title: "Timeline",
    icon: <CalendarDays className="mr-2 h-4 w-4" />,
    description: "Development and operational timeline",
    value: "timeline"
  },
  {
    title: "OpEx",
    icon: <FileText className="mr-2 h-4 w-4" />,
    description: "Operating expense assumptions",
    value: "opex"
  },
  {
    title: "OpRev",
    icon: <BarChart3 className="mr-2 h-4 w-4" />,
    description: "Operating revenue projections",
    value: "oprev"
  },
  {
    title: "CapEx",
    icon: <Workflow className="mr-2 h-4 w-4" />,
    description: "Capital expenditure planning",
    value: "capex"
  },
  {
    title: "Financing",
    icon: <BookOpen className="mr-2 h-4 w-4" />,
    description: "Debt and equity structure",
    value: "financing"
  },
  {
    title: "Disposition",
    icon: <Percent className="mr-2 h-4 w-4" />,
    description: "Exit strategy and returns",
    value: "disposition"
  },
  {
    title: "Sensitivity",
    icon: <LineChart className="mr-2 h-4 w-4" />,
    description: "Scenario and sensitivity analysis",
    value: "sensitivity"
  }
];

export type ActiveTabProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const MainNavigation = ({ activeTab, setActiveTab }: ActiveTabProps) => {
  return (
    <NavigationMenu className="max-w-full w-full justify-start overflow-x-auto py-2">
      <NavigationMenuList className="flex space-x-2 px-4">
        {sections.map((section) => (
          <NavigationMenuItem key={section.value}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "flex items-center px-4 py-2 text-sm font-medium",
                      activeTab === section.value 
                        ? "bg-blue-100 text-blue-700" 
                        : "hover:bg-blue-50"
                    )}
                    onClick={() => setActiveTab(section.value)}
                  >
                    {section.icon}
                    {section.title}
                  </NavigationMenuLink>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-blue-50 border-blue-200">
                  <p>{section.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigation;
