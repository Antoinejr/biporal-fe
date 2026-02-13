import ProtectedRoute from "./features/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Person from "./pages/Person";
import Site from "./pages/Site";
import Token from "./pages/Token";
import AuthProvider from "./providers/authProvider";
import { BrowserRouter, Routes, Route } from "react-router";
import Contractor from "./pages/Contractor";
import Blocked from "./pages/Blocked";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ContractorDetails from "./features/ContractorDetails";
import PersonDetails from "./features/PersonDetails";
import SiteDetails from "./features/SiteDetails";
import Funding from "./pages/Funding";
import Expenditure from "./pages/Expenditure";
import Logs from "./pages/Logs";
import Setting from "./pages/Setting";
import FunctionalityRoute from "./features/FunctionalityRoute";
import FunctionalityProvider from "./providers/functionalityProvider";
import Defaulters from "./pages/Defaulters";
import NotFound from "./pages/NotFound";
import SupervisorHistory from "./pages/SupervisorHistory";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <FunctionalityProvider>
            <Routes>
              <Route path="login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route element={<FunctionalityRoute />}>
                  <Route path="contractors" element={<Contractor />} />
                  <Route path="sites" element={<Site />} />
                  <Route path="tokens" element={<Token />} />
                  <Route path="logs" element={<Logs />} />
                  <Route path="fundings" element={<Funding />} />
                  <Route path="expenditures" element={<Expenditure />} />
                  <Route path="defaulters" element={<Defaulters />} />
                  <Route path="blocked" element={<Blocked />} />
                  <Route path="settings" element={<Setting />} />
                  <Route
                    path="contractors/d/:id"
                    element={<ContractorDetails />}
                  />
                  <Route
                    path="persons/category/:category"
                    element={<Person />}
                  />
                  <Route path="persons/d/:id" element={<PersonDetails />} />
                  <Route
                    path="persons/d/history/:id"
                    element={<SupervisorHistory />}
                  />
                  <Route path="sites/d/:id" element={<SiteDetails />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Routes>
          </FunctionalityProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
