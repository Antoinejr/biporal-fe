import http from "@/lib/axiosClient";
import type { PageBasedPagination } from "@/lib/baseTypes";
import type { AxiosResponse } from "axios";

export type InfractionReason = "NO_TAPOUT" | "LATE_TAPOUT";

type DefaulterQuery = {
  page?: number;
  reason?: InfractionReason
  startDate?: string;
  endDate?: string;
};

export type Defaulter = {
  id: number;
  firstName: string;
  lastName: string;
  lagId: string;
  reason: InfractionReason;
  site: string;
  timestamp: Date;
};

export type DefaulterResponse = {
  data: Defaulter[],
  pagination: PageBasedPagination,
}

export async function getDefaulters(queries: DefaulterQuery ) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== "",
    ),
  ) as DefaulterQuery;
  try {
    const response = await http.get<DefaulterResponse>('api/access/defaulters',{
      params: filtered
    });
    return response.data;
  } catch(err) {
    console.error(err);
    throw err;
  }
}

function getFileName(r: AxiosResponse, extension: string) {
  const contentDisposition = r.headers["content-disposition"];
  let fileName= `defaulters_report_${new Date().toLocaleDateString("en-NG")}.${extension}`
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/fileName"?(.+?)"?$/)
    if (fileNameMatch > 1)
    fileName = fileNameMatch[1]
  }
  return fileName
}

export async function getDefaultersPdf(queries: DefaulterQuery) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as DefaulterQuery
  try {
     const response = await http.get("api/export/defaulters/pdf", {
      params: filtered,
      responseType: "blob"
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = getFileName(response, "pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch(error) {
    console.error(error);
  }
}

export async function getDefaultersCsv(queries: DefaulterQuery) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as DefaulterQuery
  try {
     const response = await http.get("api/export/defaulters/csv", {
      params: filtered,
      responseType: "blob"
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = getFileName(response, "csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch(error) {
    console.error(error);
  }
}

export async function getDefaultersXlsx(queries: DefaulterQuery) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as DefaulterQuery
  try {
     const response = await http.get("api/export/defaulters/xlsx", {
      params: filtered,
      responseType: "blob"
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = getFileName(response, "xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch(error) {
    console.error(error);
  }
}
