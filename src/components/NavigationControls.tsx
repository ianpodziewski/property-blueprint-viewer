
import { useModel } from "@/context/ModelContext";
import SaveButton from "./SaveButton";

const NavigationControls = () => {
  const { activeTab } = useModel();
  
  return (
    <div className="flex items-center gap-2">
      <SaveButton />
      {/* Additional navigation controls can be added here in the future */}
    </div>
  );
};

export default NavigationControls;
