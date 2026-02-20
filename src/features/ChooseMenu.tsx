import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type OptionType<T> = {
  name: string;
  value: T;
};

type ChooseMenuProps<T> = {
  options: OptionType<T>[];
  state: T;
  label: string | React.ReactNode;
  disabled?: boolean;
  handleSelect: (option: OptionType<T>) => void;
};

const ChooseMenu = <T,>(props: ChooseMenuProps<T>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {props.label}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {props.options.map((option) => (
            <DropdownMenuItem
              disabled={props.disabled}
              className={cn(props.state === option.value ? "bg-gray-100" : "")}
              key={option.name}
              onSelect={() => props.handleSelect(option)}
            >
              {option.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChooseMenu;
