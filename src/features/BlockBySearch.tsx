import FormError from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  blockAccess,
  findTokensActiveToday,
  type TokensActiveToday,
} from "@/services/blocklistService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const BlockBySearch = () => {
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [search, setSearch] = useState<string>("");
  const [value, setValue] = useState<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["blockbysearch", search],
    queryFn: () => findTokensActiveToday({ search }),
    enabled: search.length > 0,
  });

  const mutation = useMutation({
    mutationFn: blockAccess,
    onSuccess: (_, vars) => {
      const id = vars.tokenId || vars.lagId;
      setBlockedIds((prev) => new Set(prev).add(id));
    },
  });

  const timeoutRef = useRef<number | undefined>(undefined);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    setValue(v);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const timeout = setTimeout(() => setSearch(v), 1000);
    timeoutRef.current = timeout;
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const normalise = (d: TokensActiveToday) => {
    if (d.lagId) {
      return { firstName: d.firstName, lastName: d.lastName, lagId: d.lagId };
    }
    return { firstName: d.firstName, lastName: d.lastName, tokenId: d.id };
  };

  return (
    <div className="flex flex-col items-center justfy-center">
      <Input
        type="text"
        className="mb-4"
        placeholder="Search..."
        value={value}
        onChange={(e) => handleValueChange(e)}
        disabled={isLoading}
      />
      {isLoading && <Loader className="animate-spin" />}
      {error && <FormError error={error} title="Fetch Failed" />}
      {data && (
        <div className="flex flex-col gap-4 min-w-full">
          <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto p-2">
            {data.data.map((d, index) => {
              const isSuccess = blockedIds.has(d.id) || blockedIds.has(d.lagId);
              return (
                <Card key={index}>
                  <CardContent className="flex justify-between items-center">
                    <div className="flex flex-col gap">
                      <span>
                        {d.firstName} {d.lastName}
                      </span>
                      <span>{d.lagId ?? "N/A"}</span>
                    </div>
                    <div>
                      <span className="italic text-muted-foreground">
                        Supervisor: {d.supervisorName}
                      </span>
                    </div>
                    <Button
                      variant={isSuccess ? "outline" : "destructive"}
                      className={isSuccess ? "bg-green-300" : ""}
                      disabled={isSuccess || mutation.isPending}
                      onClick={() => mutation.mutate(normalise(d))}
                    >
                      {isSuccess ? <Check /> : "Block"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockBySearch;
