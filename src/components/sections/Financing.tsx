
import { useState } from "react";
import CapitalStackCard from "./financing/CapitalStackCard";
import DebtFinancing from "./financing/DebtFinancing";
import EquityStructure from "./financing/EquityStructure";

const Financing = () => {
  const [loanType, setLoanType] = useState<"construction" | "permanent" | "both">("both");
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Financing</h2>
        <p className="text-gray-600 mb-6">Set up your project's debt and equity structure.</p>
      </div>
      
      <CapitalStackCard />
      <DebtFinancing loanType={loanType} setLoanType={setLoanType} />
      <EquityStructure />
    </div>
  );
};

export default Financing;
