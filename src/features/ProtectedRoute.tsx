import useAuth from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";
import Layout from "./Layout";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="w-screen h-screen">
      {isAuthenticated ? (
        <Layout>
          <Outlet />
        </Layout>
      ) : (
        <Navigate to="/login" replace />
      )}
    </div>
  );
};

export default ProtectedRoute;
