import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  value: string | number;
}
function StatCard({ title, value, className, ...props }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader>
        <CardTitle className="font-bold text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="font-700 text-lg">{value}</span>
      </CardContent>
    </Card>
  );
}
export default StatCard;
