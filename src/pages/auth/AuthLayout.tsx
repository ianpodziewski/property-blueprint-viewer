
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-md px-4 py-8">
          <div className="flex justify-center mb-8">
            <h2 className="text-2xl font-bold">RE-Model Generator</h2>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
