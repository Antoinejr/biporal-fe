import http from "@/lib/axiosClient";
import type { ActivityLogResponse } from "@/lib/activityLogsTypes";
import type { PageDirection } from "@/lib/baseTypes";

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
