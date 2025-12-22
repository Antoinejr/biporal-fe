import type { Category } from "@/lib/activityLogsTypes";
import { cn } from "@/lib/utils";


type CategoryBadgeProps = {
  value: Category;
};

const styling: Record<Category, string> = {
  RESIDENT: "px-2 py-1 bg-blue-100 text-blue-800 rounded-sm",
  SUPERVISOR: "px-2 py-1 bg-green-100 text-green-800 rounded-sm",
  DEPENDENT: "px-2 py-1 bg-yellow-100 text-yellow-800 rounded-sm",
  WORKER: "px-2 py-1 bg-purple-100 text-purple-800 rounded-sm",
  ARTISAN: "px-2 py-1 bg-red-100 text-red-800 rounded-sm",
};

function CategoryBadge({ value }: CategoryBadgeProps) {
  return (
    <span className={cn(styling[value])}>
      {value}
    </span>
  );
}

export default CategoryBadge;
