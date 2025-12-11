import Biporal from "@/assets/BIPORAL_2-Medium.png";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Clipboard,
  Home,
  ShieldAlert,
  ClipboardClock,
  MapPinned,
  Ticket,
  User,
  HardHat,
} from "lucide-react";
import { useNavigate } from "react-router";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigator = useNavigate();
  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
    {
      name: "Contractors",
      path: "/contractors",
      icon: <HardHat className="w-5 h-5" />,
    },
    { name: "Persons", path: "/persons", icon: <User className="w-5 h-5" /> },
    { name: "Sites", path: "/sites", icon: <MapPinned className="w-5 h-5" /> },
    { name: "Tokens", path: "/tokens", icon: <Ticket className="w-5 h-5" /> },
    {
      name: "Reports",
      path: "/reports",
      icon: <Clipboard className="w-5 h-5" />,
    },
    {
      name: "BlockList",
      path: "/blocked",
      icon: <ShieldAlert className="w-5 h-5" />,
    },
    {
      name: "Policies",
      path: "/policy",
      icon: <ClipboardClock className="w-5 h-5" />,
    },
  ];
  const { signOut } = useAuth();
  const handleLogout = () => {
    signOut();
    navigator("/login");
  };

  return (
    <div
      className={cn(
        "grid grid-rows-[auto_auto_1fr]",
        "p-4 min-h-screen min-w-screen",
        "gap-2",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={Biporal}
            alt="Biporal logo"
            className="h-[80px] w-[80px] object-contain shrink-0"
          />
        </div>
        <Button
          className={cn("text-red-400")}
          variant="link"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
      <nav className="flex gap-1 justify-center">
        {navItems.map((item, index) => {
          return (
            <Button
              variant="link"
              key={index}
              className={cn(
                location.pathname === item.path &&
                  "bg-[#DDFFD1] text-[#059669]",
              )}
              onClick={() => navigator(item.path)}
            >
              {item.icon}
              <span>{item.name}</span>
            </Button>
          );
        })}
      </nav>
      <div>{children}</div>
    </div>
  );
};

export default Layout;
