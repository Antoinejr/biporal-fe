import type { Category } from "@/lib/activityLogsTypes";
import http from "@/lib/axiosClient";
import type { PageBasedPagination } from "@/lib/baseTypes";
import type {
  CreatePersonType,
  GetPersonsResponse,
  Person,
  ResidentLookupResponse,
} from "@/lib/personTypes";
import type { AxiosResponse } from "axios";

type GetPersonQuery = {
  page?: number;
  isActive?: boolean;
  search?: string;
  category?: Category;
};

export type SupervisorHistory = {
  assignmentId: string;
  siteId: string;
  siteName: string;
  contractorId: string;
  contractorName: string;
  startDate: Date;
  endDate: Date | null;
  firstDate: Date;
  recentChange: Date;
  isActive: boolean;
};

type GetSupervisorHistoryResponse = {
  data: SupervisorHistory[];
  pagination: PageBasedPagination;
};

type GetSupervisorHistoryFilters = {
  search?: string;
};

export interface Assignment {
  id: string;
  firstName: string;
  lastName: string;
  supervisorId: string;
  contractor: string;
  contractorId: string;
  site: string;
  siteId: string;
  startDate: Date;
  endDate: Date | null;
}

interface AssignmentResponse {
  data: Assignment[];
  pagination: PageBasedPagination;
}

interface GetAssignmentQuery {
  page?: number;
  search?: string;
}

export async function getAssignments(query: GetAssignmentQuery) {
  const filtered = Object.fromEntries(
    Object.entries(query).filter(([_, v]) => v !== undefined && v !== ""),
  ) as GetAssignmentQuery;
  try {
    const response = await http.get<AssignmentResponse>("api/person/report", {
      params: filtered,
    });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function getFileName(r: AxiosResponse, extension: string) {
  const contentDisposition = r.headers["content-disposition"];
  let fileName = `supervisor_report_${new Date().toLocaleDateString("en-NG")}.${extension}`;
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/fileName"?(.+?)"?$/);
    if (fileNameMatch > 1) fileName = fileNameMatch[1];
  }
  return fileName;
}

export async function getAssignmentsPdf(query: GetAssignmentQuery) {
  const filtered = Object.fromEntries(
    Object.entries(query).filter(([_, v]) => v !== undefined && v !== ""),
  ) as GetAssignmentQuery;
  try {
    const response = await http.get("api/export/supervisor/pdf", {
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
    console.error(err);
    throw err;
  }
}
export async function getAssignmentsCsv(query: GetAssignmentQuery) {
  const filtered = Object.fromEntries(
    Object.entries(query).filter(([_, v]) => v !== undefined && v !== ""),
  ) as GetAssignmentQuery;
  try {
    const response = await http.get("api/export/supervisor/csv", {
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
    console.error(err);
    throw err;
  }
}
export async function getAssignmentsXlsx(query: GetAssignmentQuery) {
  const filtered = Object.fromEntries(
    Object.entries(query).filter(([_, v]) => v !== undefined && v !== ""),
  ) as GetAssignmentQuery;
  try {
    const response = await http.get("api/export/supervisor/xlsx", {
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
    console.error(err);
    throw err;
  }
}

export async function getSupervisorHistory(
  id: string,
  filters: GetSupervisorHistoryFilters,
) {
  const filtered = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== undefined && value !== "",
    ),
  ) as GetSupervisorHistoryFilters;
  try {
    const res = await http.get<GetSupervisorHistoryResponse>(
      `/api/person/history/${id}`,
      { params: filtered },
    );
    console.log(JSON.stringify(res.data.data));
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deactivatePerson(id: string) {
  try {
    await http.delete(`/api/person/${id}`);
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function activatePerson(id: string) {
  try {
    await http.patch(`/api/person/activate/${id}`);
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function extendToken(payload: {
  id: string;
  payload: { length: number };
}): Promise<void> {
  try {
    await http.patch(`/api/person/refresh/${payload.id}`, payload.payload);
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updatePerson(payload: {
  id: string;
  payload: Partial<CreatePersonType>;
}) {
  try {
    await http.patch(`/api/person/${payload.id}`, payload.payload);
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getOnePerson(id: string) {
  try {
    const response = await http.get<Person>(`/api/person/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getPersons(payload: GetPersonQuery) {
  const data: GetPersonQuery = {};
  if (payload.page) {
    data.page = payload.page;
  }
  if (payload.search && payload.search !== "") {
    data.search = payload.search;
  }
  if (payload.category) {
    data.category = payload.category;
  }
  // BUG: Hardcoded
  // data.isActive = true;
  try {
    const response = await http.get<GetPersonsResponse>("/api/person", {
      params: data,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to retrieve persons", { cause: error });
    throw error;
  }
}

export async function createPerson(payload: CreatePersonType) {
  try {
    await http.post<void>("/api/person", payload);
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function lookupResidents() {
  try {
    const response = await http.get<ResidentLookupResponse>(
      "/api/person/lookup/residents",
    );
    const data = response.data.data.map((p) => ({
      name: p.fullName,
      value: p.id,
    }));
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
