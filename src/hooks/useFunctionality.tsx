import FunctionalityContext from "@/context/functionalityContext";
import { useContext } from "react";

function useFunctionality() {
  const context = useContext(FunctionalityContext);
  if (!context) {
    throw new Error(`useFunctionality must be used within a FunctionalityProvider`);
  }
  return context;
}

export default useFunctionality;
