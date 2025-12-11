import ProtectedRoute from "./features/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Person from "./pages/Person";
import Site from "./pages/Site";
import Report from "./pages/Report";
import Token from "./pages/Token";
import AuthProvider from "./providers/authProvider";
import { BrowserRouter, Routes, Route } from "react-router";
import Contractor from "./pages/Contractor";
import Blocked from "./pages/Blocked";
import Policy from "./pages/Policy";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
              <Route path="persons" element={<Person />} />
              <Route path="sites" element={<Site />} />
              <Route path="tokens" element={<Token />} />
              <Route path="reports" element={<Report />} />
              <Route path="blocked" element={<Blocked />} />
              <Route path="policy" element={<Policy />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
