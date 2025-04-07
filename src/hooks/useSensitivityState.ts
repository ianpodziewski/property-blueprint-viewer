
import { useState } from "react";

export const useSensitivityState = () => {
  // Sensitivity Variables
  const [sensitivityVariable1, setSensitivityVariable1] = useState<string>("exit-cap");
  const [variable1MinRange, setVariable1MinRange] = useState<string>("");
  const [variable1MaxRange, setVariable1MaxRange] = useState<string>("");
  const [sensitivityVariable2, setSensitivityVariable2] = useState<string>("rent-growth");
  const [variable2MinRange, setVariable2MinRange] = useState<string>("");
  const [variable2MaxRange, setVariable2MaxRange] = useState<string>("");
  const [outputMetric, setOutputMetric] = useState<string>("equity-irr");
  
  // Scenario Analysis
  const [baseScenarioRentGrowth, setBaseScenarioRentGrowth] = useState<string>("");
  const [baseScenarioExitCap, setBaseScenarioExitCap] = useState<string>("");
  const [upsideScenarioRentGrowth, setUpsideScenarioRentGrowth] = useState<string>("");
  const [upsideScenarioExitCap, setUpsideScenarioExitCap] = useState<string>("");
  const [downsideScenarioRentGrowth, setDownsideScenarioRentGrowth] = useState<string>("");
  const [downsideScenarioExitCap, setDownsideScenarioExitCap] = useState<string>("");
  
  // Monte Carlo Simulation
  const [monteCarloSimulationRuns, setMonteCarloSimulationRuns] = useState<string>("");
  const [targetIrrThreshold, setTargetIrrThreshold] = useState<number[]>([15]);
  
  return {
    // Sensitivity Variables
    sensitivityVariable1, setSensitivityVariable1,
    variable1MinRange, setVariable1MinRange,
    variable1MaxRange, setVariable1MaxRange,
    sensitivityVariable2, setSensitivityVariable2,
    variable2MinRange, setVariable2MinRange,
    variable2MaxRange, setVariable2MaxRange,
    outputMetric, setOutputMetric,
    
    // Scenario Analysis
    baseScenarioRentGrowth, setBaseScenarioRentGrowth,
    baseScenarioExitCap, setBaseScenarioExitCap,
    upsideScenarioRentGrowth, setUpsideScenarioRentGrowth,
    upsideScenarioExitCap, setUpsideScenarioExitCap,
    downsideScenarioRentGrowth, setDownsideScenarioRentGrowth,
    downsideScenarioExitCap, setDownsideScenarioExitCap,
    
    // Monte Carlo Simulation
    monteCarloSimulationRuns, setMonteCarloSimulationRuns,
    targetIrrThreshold, setTargetIrrThreshold
  };
};
