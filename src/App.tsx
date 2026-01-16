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

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="contractors" element={<Contractor />} />
              <Route path="sites" element={<Site />} />
              <Route path="tokens" element={<Token />} />
              <Route path="logs" element={<Logs />} />
              <Route path="fundings" element={<Funding />} />
              <Route path="expenditures" element={<Expenditure/>} />
              <Route path="blocked" element={<Blocked />} />
              <Route path="settings" element={<Setting />} />
              <Route path="contractors/:id" element={<ContractorDetails />} />
              <Route path="persons/category/:category" element={<Person />} />
              <Route path="persons/:id" element={<PersonDetails />} />
              <Route path="sites/:id" element={<SiteDetails />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
