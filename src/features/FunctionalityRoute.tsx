import useFunctionality from "@/hooks/useFunctionality"
import { Navigate, Outlet } from "react-router";

function FunctionalityRoute() {
  const { level } = useFunctionality();

  function isFullLevel(): boolean {
    if(!level) return false; // level is not defined
    if (level.toLowerCase() === "full") return true;
    return false;
  }

  return (
    <div>
    {
      isFullLevel() ?
      <Outlet /> :
      <Navigate to="/" replace />
    }
    </div>
  )
  
}

export default FunctionalityRoute
