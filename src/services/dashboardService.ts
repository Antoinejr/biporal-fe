import http from "@/lib/axiosClient";
import type { ActivityLogResponse, Category } from "@/lib/activityLogsTypes";
import type { PageDirection } from "@/lib/baseTypes";
import type { ReportLogResponse } from "@/lib/dashboardType";

type ReportQueryType = {
  page?: number;
  startDate?: string;
  endDate?: string;
  siteId?: string;
  action?: string;
  category?: Category;
  isRejected?: boolean;
}

export const getRecentLogActivity = async ({
  direction,
  cursor,
}: {
  direction?: PageDirection;
  cursor?: string;
}) => {
  try {
    let payload: { direction?: PageDirection; cursor?: string } = {};
    if (direction) {
      payload.direction = direction;
    }
    if (cursor) {
      payload.cursor = cursor;
    }
    console.log(payload);
    const response = await http.get<ActivityLogResponse>("/api/access", {
      params: payload,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export async function getLogSnapshot(queries: ReportQueryType) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as ReportQueryType
  try {
    const response = await http.get<ReportLogResponse>("api/access/report", {
      params: filtered
    });
    return response.data;
  } catch(error) {
    console.error(error);
    throw error;
  }
}
