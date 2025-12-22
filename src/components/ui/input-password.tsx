import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "./input";

interface InputPasswordProps extends React.ComponentProps<typeof Input> {}

const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const Icon = showPassword ? EyeOff : Eye;

    return (
      <div className={cn("relative flex items-center", className)}>
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className="pr-10"
          {...props}
        />

        <button
          type="button"
          disabled={props.disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-0 h-full p-3 text-muted-foreground transition-colors hover:text-foreground/70"
          tabIndex={-1}
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
    );
  },
);

InputPassword.displayName = "InputPassword";

export { InputPassword };
