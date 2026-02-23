import {
  createContext,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface PageSwitcherProps {
  children: ReactNode;
  defaultForm: string;
}

interface PageSwitcherContext {
  page: string;
  toggle: (n: string) => void;
}

const pageContext = createContext<PageSwitcherContext | null>(null);

const PageSwitcher = ({ children, defaultForm }: PageSwitcherProps) => {
  const [page, setPage] = useState(defaultForm);
  return (
    <pageContext.Provider value={{ page, toggle: (n: string) => setPage(n) }}>
      {children}
    </pageContext.Provider>
  );
};

const PageToggle = ({
  children,
  name,
}: {
  children: ReactElement;
  name: string;
}) => {
  const { page, toggle } = useContext(pageContext)!;
  const active = page === name;
  return (
    <Button
      onClick={() => toggle(name)}
      variant="link"
      className={cn(active ? "font-bold" : "")}
    >
      {children}
    </Button>
  );
};

const PagePanel = ({
  children,
  name,
}: {
  children: ReactNode;
  name: string;
}) => {
  const { page } = useContext(pageContext)!;
  const active = page === name;
  return active && <div>{children}</div>;
};

PageSwitcher.Panel = PagePanel;
PageSwitcher.Button = PageToggle;

export default PageSwitcher;
