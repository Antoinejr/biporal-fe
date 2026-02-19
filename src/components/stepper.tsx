import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";

function FormStepper({ field }: { field: any }) {
  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => field.handleChange(Math.max(1, field.state.value - 1))}
      >
        <Minus />
      </Button>
      <span className="text-2xl font-bold w-12 text-center">
        {field.state.value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => field.handleChange(field.state.value + 1)}
      >
        <Plus size="sm" />
      </Button>
    </div>
  );
}
export default FormStepper;
