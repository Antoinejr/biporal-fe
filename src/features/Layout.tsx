import Biporal from "@/assets/BIPORAL_2-Medium.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import useFunctionality from "@/hooks/useFunctionality";
import { cn } from "@/lib/utils";
import {
  Clipboard,
  Home,
  MapPinned,
  Ticket,
  User,
  HardHat,
  Settings,
  ClipboardClock,
  ChevronDown,
  BanknoteArrowUp,
  BanknoteArrowDown,
  UserLock,
  Ban,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";

const mainNavItems = [
  { name: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
  {
    name: "Contractors",
    path: "/contractors",
    icon: <HardHat className="w-5 h-5" />,
  },
  {
    name: "Supervisors",
    path: "/persons/category/SUPERVISOR",
    icon: <User className="w-5 h-5" />,
  },
  { name: "Sites", path: "/sites", icon: <MapPinned className="w-5 h-5" /> },
  // { name: "Tokens", path: "/tokens", icon: <Ticket className="w-5 h-5" /> },
  { name: "Blocklist", path: "/blocklist", icon: <Ban className="w-5 h-5" /> },
  {
    name: "Settings",
    path: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

// TOOD: Add back when feature is needed
const personMenuItems = [
  {
    name: "Residents",
    path: "/persons/category/RESIDENT",
    icon: <User className="w-5 h-5" />,
  },
  {
    name: "Supervisors",
    path: "/persons/category/SUPERVISOR",
    icon: <User className="w-5 h-5" />,
  },
  {
    name: "Dependents",
    path: "/persons/category/DEPENDENT",
    icon: <User className="w-5 h-5" />,
  },
  {
    name: "Workers",
    path: "/persons/category/WORKER",
    icon: <User className="w-5 h-5" />,
  },
];

const reportMenuItems = [
  {
    name: "Logs",
    path: "/logs",
    icon: <ClipboardClock className="w-4 h-4" />,
  },
  {
    name: "Fundings",
    path: "/fundings",
    icon: <BanknoteArrowUp className="w-4 h-4" />,
  },
  {
    name: "Expenditures",
    path: "/expenditures",
    icon: <BanknoteArrowDown className="w-4 h-4" />,
  },
  // {
  //   name: "Defaulters",
  //   path: "/defaulters",
  //   icon: <UserLock className="w-4 h-4" />,
  // },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigator = useNavigate();
  const location = useLocation();
  const { level } = useFunctionality();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigator("/login");
  };

  const isReportMenuActive = reportMenuItems.some(
    (item) => location.pathname === item.path,
  );

  const isPersonMenuActive = personMenuItems.some(
    (item) => location.pathname === item.path,
  );

  return (
    <div
      className={cn(
        "grid",
        level === "partial"
          ? "grid-rows-[auto_1fr]"
          : "grid-rows-[auto_auto_1fr]",
        "p-4 min-h-screen min-w-screen",
        "gap-2",
      )}
    >
      {/* Header with logo and logout */}
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

      {/* Navigation - only show when not in partial mode */}
      {level !== "partial" && (
        <nav className="flex gap-1 justify-center">
          {mainNavItems.map((item, index) => {
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

          {/* Persons Dropdown */}
          {false && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="link"
                  className={cn(
                    "gap-1",
                    isPersonMenuActive && "bg-[#DDFFD1] text-[#059669]",
                  )}
                >
                  <User className="w-5 h-5" />
                  <span>Persons</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {personMenuItems.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => navigator(item.path)}
                    className={cn(
                      "cursor-pointer gap-2 flex justify-start",
                      location.pathname === item.path &&
                        "bg-[#DDFFD1] text-[#059669]",
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Reports Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="link"
                className={cn(
                  "gap-1",
                  isReportMenuActive && "bg-[#DDFFD1] text-[#059669]",
                )}
              >
                <Clipboard className="w-5 h-5" />
                <span>Reports</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {reportMenuItems.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => navigator(item.path)}
                  className={cn(
                    "cursor-pointer gap-2 flex justify-start",
                    location.pathname === item.path &&
                      "bg-[#DDFFD1] text-[#059669]",
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      )}

      {/* Main content */}
      <div>{children}</div>
    </div>
  );
};

export default Layout;
