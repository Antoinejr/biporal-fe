import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type OptionType<T> = {
  name: string;
  value: T;
};

type ChooseMenuProps<T> = {
  options: OptionType<T>[];
  state: T;
  label: string;
  handleSelect: (option: OptionType<T>) => void;
};

const ChooseMenu = <T,>(props: ChooseMenuProps<T>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{props.label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {props.options.map((option) => (
            <DropdownMenuItem
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
