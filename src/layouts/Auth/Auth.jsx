import { Outlet } from "react-router-dom";

function Auth() {
  return (
    <div className="overflow-hidden">
      <Outlet />
    </div>
  );
}

export default Auth;
