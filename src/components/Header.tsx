
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold">RE-Model Generator</h1>
          
          {user && (
            <nav className="hidden md:flex space-x-4">
              <Link to="/projects" className="text-gray-600 hover:text-gray-900">
                Projects
              </Link>
            </nav>
          )}
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
