import PagelessTable from "@/components/pageless-table";
import { ActivityLogsColumns } from "@/features/ActivityLogsColumnDef";
import env from "@/lib/env";
import { cn } from "@/lib/utils";
import { getRecentLogActivity } from "@/services/dashboardService";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import io from "socket.io-client";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { data, isFetching, fetchNextPage, error } = useInfiniteQuery({
    queryKey: ["logs"],
    queryFn: ({ pageParam }) => getRecentLogActivity({ cursor: pageParam }),
    initialPageParam: undefined as Date | undefined,
    getNextPageParam: (lastPage, _) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.nextCursor;
      }
      return undefined;
    },
  });

  useEffect(() => {
    // set socket url based on environment
    let socketurl = window.location.origin;
    if (env.ENVIRONMENT == "development") {
      socketurl = env.BASE_URL;
    }
    const socket = io(socketurl, { transports: ["websocket", "polling"] });
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
  const columns = useMemo(() => ActivityLogsColumns, []);
  return (
    <div className={cn("grid grid-rows-[auto_1fr]", "px-4 space-y-8")}>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">DASHBOARD</h1>
        <p className="text-muted-foreground">
          Monitor all entries and exits in realtime
        </p>
      </header>
      <PagelessTable
        columns={columns}
        data={data?.pages.flatMap((resp) => resp.data) ?? []}
        loading={isFetching}
        error={error}
        fetchNextPage={fetchNextPage}
      />
    </div>
  );
};

export default Dashboard;
