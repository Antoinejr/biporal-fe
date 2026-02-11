import DataTable from "@/components/data-table";
import { ActivityLogsColumns } from "@/features/ActivityLogsColumnDef";
import StatCard from "@/features/StatCard";
import type { PageDirection } from "@/lib/baseTypes";
import env from "@/lib/env";
import { cn, convertHourToString } from "@/lib/utils";
import {
  getDashboardKpi,
  getRecentLogActivity,
} from "@/services/dashboardService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";

const Dashboard = () => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [direction, setDirection] = useState<PageDirection | undefined>(
    undefined,
  );
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["logs", direction, cursor],
    queryFn: () => getRecentLogActivity({ direction, cursor }),
  });
  const statsQuery = useQuery({
    queryKey: ["kpi"],
    queryFn: () => getDashboardKpi(),
  });

  useEffect(() => {
    const sfd = io(env.BASE_URL);
    sfd.on("connect", () => console.log("Connected to host"));
    sfd.on("connect_error", (error) =>
      console.error("Connection failed", error.message),
    );
    sfd.on("disconnect", (reason) =>
      console.log("Client Disconnected", reason),
    );
    sfd.on("newAccess", () =>
      queryClient.invalidateQueries({ queryKey: ["logs"] }),
    );

    return () => {
      console.log("Cleaning up socket");
      sfd.close();
    };
  }, []);

  const nextPage = useCallback(() => {
    if (!data) return;
    if (!data.pagination.nextCursor) return;
    setCursor(new Date(data.pagination.nextCursor!).toISOString());
    setDirection("next");
  }, [data]);

  const prevPage = useCallback(() => {
    if (!data) return;
    if (!data.pagination.prevCursor) return;
    setCursor(new Date(data.pagination.prevCursor!).toISOString());
    setDirection("prev");
  }, [data]);
  return (
    <div className={cn("grid grid-rows-[auto_1fr]", "px-4 space-y-8")}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">View entry and exits logs</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        <StatCard
          title="Total Entries Today"
          value={statsQuery.data?.totalEntriesToday ?? 0}
        />
        <StatCard
          title="Total Exits Today"
          value={statsQuery.data?.totalExitsToday ?? 0}
        />
        <StatCard
          title="Busiest Site Today"
          value={(statsQuery.data?.topSite.site ?? "----").toUpperCase()}
        />
        <StatCard
          title="Busiest Hour Today"
          value={
            statsQuery.data
              ? convertHourToString(statsQuery.data.peakHourToday.hour)
              : "----"
          }
        />
        <StatCard
          title="Busiest Day All-time"
          value={statsQuery.data?.peakDayAllTime.day ?? "----"}
        />
      </div>
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
