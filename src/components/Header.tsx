
import { Building } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
      <div className="container mx-auto flex items-center">
        <Building className="h-6 w-6 mr-2 text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
          Real Estate <span className="text-blue-500">Modeling Tool</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
