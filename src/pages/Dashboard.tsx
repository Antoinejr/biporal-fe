import DataTable from "@/components/data-table";
import { ActivityLogsColumns } from "@/features/ActivityLogsColumnDef";
import type { PageDirection } from "@/lib/baseTypes";
import env from "@/lib/env";
import { cn } from "@/lib/utils";
import { getRecentLogActivity } from "@/services/dashboardService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";

const Dashboard = () => {
  const [pagePosition, setPagePosition] = useState<string | undefined>(
    undefined,
  );
  const [pageOrder, setPageOrder] = useState<PageDirection | undefined>(
    undefined,
  );
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["logs", pageOrder, pagePosition],
    queryFn: () =>
      getRecentLogActivity({ direction: pageOrder, cursor: pagePosition }),
  });

  useEffect(() => {
    const socket = io(env.BASE_URL);
    socket.on("connect", () => console.log("Connected to host"));
    socket.on("connect_error", (error) =>
      console.error("Connection failed", error.message),
    );
    socket.on("disconnect", (reason) =>
      console.log("Client Disconnected", reason),
    );
    socket.on("newAccess", () =>
      queryClient.invalidateQueries({ queryKey: ["logs"] }),
    );

    return () => {
      console.log("Cleaning up socket");
      socket.close();
    };
  }, []);

  const nextPage = useCallback(() => {
    const nextCursor = data?.pagination.nextCursor;
    if (!nextCursor) return;

    setPagePosition(new Date(nextCursor).toISOString());
    setPageOrder("next");
  }, [data]);

  const prevPage = useCallback(() => {
    const prevCursor = data?.pagination.prevCursor;
    if (!prevCursor) return;

    setPagePosition(new Date(prevCursor).toISOString());
    setPageOrder("prev");
  }, [data]);

  return (
    <div className={cn("grid grid-rows-[auto_1fr]", "px-4 space-y-8")}>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor all entries and exits in realtime
        </p>
      </header>

      <DataTable
        columns={ActivityLogsColumns}
        data={data?.data ?? []}
        loading={isLoading}
        error={error}
        hasNext={data?.pagination.hasNextPage ?? false}
        hasPrev={data?.pagination.hasPrevPage ?? false}
        next={nextPage}
        prev={prevPage}
      />
    </div>
  );
};

export default Dashboard;
