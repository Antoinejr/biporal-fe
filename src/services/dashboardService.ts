import http from "@/lib/axiosClient";
import type { ActivityLogResponse, Category } from "@/lib/activityLogsTypes";
import type { PageDirection } from "@/lib/baseTypes";
import type { ReportLogResponse } from "@/lib/dashboardType";
import type { AxiosResponse } from "axios";

type ReportQueryType = {
  page?: number;
  startDate?: string;
  endDate?: string;
  siteId?: string;
  action?: string;
  category?: Category;
  isRejected?: boolean;
  isLate?: boolean;
  hasNotLeft?: boolean;
}

export interface Kpi {
  totalEntriesToday: number;
  totalExitsToday: number;
  topSite: {site: string, count: number};
  peakHourToday: {hour: number, count: number};
  peakDayAllTime: {day: string, count: number};
}

export async function getDashboardKpi() {
  try {
    const res = await http.get<Kpi>("api/analytics/dashboard")
    return res.data
  } catch(err) {
    throw err;
  }
}
export const getRecentLogActivity = async ({
  direction,
  cursor,
}: {
  direction?: PageDirection;
  cursor?: string;
}) => {
  try {
    const payload: { direction?: PageDirection; cursor?: string } = {};
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

function getFileName(r: AxiosResponse, extension: string) {
  const contentDisposition = r.headers["content-disposition"];
  let fileName= `log_report_${new Date().toLocaleDateString("en-NG")}.${extension}`
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/fileName"?(.+?)"?$/)
    if (fileNameMatch > 1)
    fileName = fileNameMatch[1]
  }
  return fileName
}

export async function getLogPdf(queries: ReportQueryType) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as ReportQueryType
  try {
     const response = await http.get("api/export/access/pdf", {
      params: filtered,
      responseType: "blob"
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = `log_report_${new Date().toLocaleDateString("en-NG")}.pdf`
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch(error) {
    console.error(error);
  }
}

export async function getLogCsv(queries: ReportQueryType) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as ReportQueryType
  try {
     const response = await http.get("api/export/access/csv", {
      params: filtered,
      responseType: "blob"
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = getFileName(response, "csv")
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch(error) {
    console.error(error);
  }
}


export async function getLogXlsx(queries: ReportQueryType) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as ReportQueryType
  try {
     const response = await http.get("api/export/access/xlsx", {
      params: filtered,
      responseType: "blob"
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = getFileName(response, "xlsx")
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch(error) {
    console.error(error);
  }
}
