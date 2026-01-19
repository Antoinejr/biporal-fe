import { createContext } from "react";

export type FunctionalityLevelType = {
  level: string
}

const FunctionalityContext = createContext<FunctionalityLevelType|undefined>(undefined);

export default FunctionalityContext;
