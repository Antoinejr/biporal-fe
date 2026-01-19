import FunctionalityContext from "@/context/functionalityContext"
import env from "@/lib/env"

function FunctionalityProvider({children}: {children: React.ReactNode}) {
  return <FunctionalityContext.Provider
    value={{level: env.FUNCTIONALITY_LEVEL}}
    >
      {children}
    </FunctionalityContext.Provider>
}

export default FunctionalityProvider
