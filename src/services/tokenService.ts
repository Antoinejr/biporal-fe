import type { Category } from "@/lib/activityLogsTypes";
import http from "@/lib/axiosClient";
import type { PageBasedPagination } from "@/lib/baseTypes";
import type { ContractorType } from "@/lib/contractorTypes";
import type { Person } from "@/lib/personTypes";
import type { SiteType } from "@/lib/siteTypes";
import type { TokenResponse } from "@/lib/tokenTypes";

type TokenQueryType = {
  page?: number;
  startDate?: string;
  endDate?: string;
  contractorId?: string;
  siteId?: string;
  category?: Category;
  isExpired?: boolean;
};

export async function findAll(queries: TokenQueryType) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== "",
    ),
  ) as TokenQueryType;
  try {
    const response = await http.get<TokenResponse>("/api/token", {
      params: filtered,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

type FindInvoiceQueries = {
  page?: number;
  siteId?: string;
  contractorId?: string;
  startDate?: string;
  endDate?: string;
}

export type Invoice = {
  id: string,
  cost: number,
  quantity: number,
  createdAt: Date,
  site: Pick<SiteType,"id" | "name">;
  supervisor: Pick<Person, "id" | "firstName" | "lastName" | "lagId">;
  contractor: Pick<ContractorType, "id" | "name">;
}

export type InvoiceResponse = {
  data: Invoice[];
  pagination: PageBasedPagination
}

export async function findInvoices(queries: FindInvoiceQueries) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== "",
    ),
  ) as FindInvoiceQueries;
  try {
    const response = await http.get<InvoiceResponse>("api/invoice", {
      params: filtered
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getInvoicePdf(queries: FindInvoiceQueries) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as FindInvoiceQueries
  try {
     const response = await http.get("api/export/download/expenditure", {
      params: filtered,
      responseType: "blob"
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = `expenditure_report_${new Date().toLocaleDateString("en-NG")}.pdf`
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch(error) {
    console.error(error);
  }
}
