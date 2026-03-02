import http from "@/lib/axiosClient";
import type { PageBasedPagination } from "@/lib/baseTypes";
import type {
  ContractorLookupType,
  CreateContractorType,
  GetContractorResponseType,
  GetOneContractorResponseType,
} from "@/lib/contractorTypes";
import type { AxiosResponse } from "axios";

type GetContractorQuery = {
  page?: number;
  isActive?: boolean;
  search?: string;
};

interface EngagementQuery {
  page?: number;
  contractor?: string;
}

export async function restoreContractor(id: string) {
  try {
    await http.patch(`api/contractor/restore/${id}`);
    return;
  } catch (error) {
    throw error;
  }
}

export async function deleteContractor(id: string) {
  try {
    await http.delete(`/api/contractor/${id}`);
    return;
  } catch (error) {
    throw error;
  }
}
export async function getOneContractor(id: string) {
  try {
    const response = await http.get<GetOneContractorResponseType>(
      `/api/contractor/${id}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateContractor(payload: {
  id: string;
  payload: Partial<CreateContractorType>;
}) {
  try {
    await http.patch<void>(`/api/contractor/${payload.id}`, payload.payload);
    return;
  } catch (error) {
    throw error;
  }
}

export async function deactivateContractor(id: string) {
  try {
    await http.delete<void>(`/api/contractor/${id}`);
    return;
  } catch (error) {
    throw error;
  }
}

export const getContractors = async (payload: GetContractorQuery) => {
  const data: GetContractorQuery = {};
  if (payload.page) {
    data.page = payload.page;
  }
  if (payload.isActive !== undefined) {
    data.isActive = payload.isActive;
  }
  if (payload.search && payload.search !== "") {
    data.search = payload.search;
  }
  try {
    const response = await http.get<GetContractorResponseType>(
      "/api/contractor",
      {
        params: data,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createContractor = async (payload: CreateContractorType) => {
  try {
    await http.post("/api/contractor", payload);
    return;
  } catch (error) {
    throw error;
  }
};

export async function lookupContractors() {
  try {
    const response = await http.get<ContractorLookupType>(
      "/api/contractor/lookup",
    );
    const data = response.data.data.map((p) => ({
      name: p.name,
      value: p.id,
    }));
    return data;
  } catch (error) {
    throw error;
  }
}

export interface Engagement {
  id: string;
  contractorId: string;
  contractor: string;
  siteId: string;
  site: string;
  supervisorCount: number;
  balance: number;
  startDate: Date;
  endDate: Date | null;
}

export interface EngagementResponse {
  data: Engagement[];
  pagination: PageBasedPagination;
}

export async function getEngagements(query: EngagementQuery) {
  const filtered = Object.fromEntries(
    Object.entries(query).filter(([_, v]) => v !== undefined && v !== ""),
  ) as EngagementQuery;
  try {
    const response = await http.get<EngagementResponse>(
      "api/contractor/report",
      { params: filtered },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}

function getFileName(r: AxiosResponse, extension: string) {
  const contentDisposition = r.headers["content-disposition"];
  let fileName = `contractor_report_${new Date().toLocaleDateString("en-NG")}.${extension}`;
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/fileName"?(.+?)"?$/);
    if (fileNameMatch > 1) fileName = fileNameMatch[1];
  }
  return fileName;
}

export async function getEngagementsXlsx(query: EngagementQuery) {
  const filtered = Object.fromEntries(
    Object.entries(query).filter(([_, v]) => v !== undefined && v !== ""),
  ) as EngagementQuery;
  try {
    const response = await http.get("api/export/contractor/xlsx", {
      params: filtered,
      responseType: "blob",
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = getFileName(response, "xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch (err) {
    throw err;
  }
}

export async function getEngagementsCsv(query: EngagementQuery) {
  const filtered = Object.fromEntries(
    Object.entries(query).filter(([_, v]) => v !== undefined && v !== ""),
  ) as EngagementQuery;
  try {
    const response = await http.get("api/export/contractor/csv", {
      params: filtered,
      responseType: "blob",
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = getFileName(response, "csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch (err) {
    throw err;
  }
}

export async function getEngagementsPdf(query: EngagementQuery) {
  const filtered = Object.fromEntries(
    Object.entries(query).filter(([_, v]) => v !== undefined && v !== ""),
  ) as EngagementQuery;
  try {
    const response = await http.get("api/export/contractor/pdf", {
      params: filtered,
      responseType: "blob",
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = getFileName(response, "pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch (err) {
    throw err;
  }
}
