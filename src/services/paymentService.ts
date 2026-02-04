import http from "@/lib/axiosClient";
import type { PageBasedPagination } from "@/lib/baseTypes";
import type { ContractorType } from "@/lib/contractorTypes";
import type { SiteType } from "@/lib/siteTypes";
import type { AxiosResponse } from "axios";

type FindPaymentFilters = {
  page?: number;
  siteId?: string;
  contractorId?: string;
  startDate?: string;
  endDate?: string;
};

export type Payment = {
  id: string;
  amount: number;
  email: string;
  paidAt: Date;
  site: Pick<SiteType,"id" | "name">;
  contractor: Pick<ContractorType, "id" | "name">;
}

export type PaymentResponse = {
  data: Payment[];
  pagination: PageBasedPagination
} 

export async function findPayments(queries: FindPaymentFilters) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== "",
    ),
  ) as FindPaymentFilters;
  try {
    const response = await http.get<PaymentResponse>("api/payment", {
      params: filtered
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
function getFileName(r: AxiosResponse, extension: string) {
  const contentDisposition = r.headers["content-disposition"];
  let fileName= `funding_report_${new Date().toLocaleDateString("en-NG")}.${extension}`
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/fileName"?(.+?)"?$/)
    if (fileNameMatch > 1)
    fileName = fileNameMatch[1]
  }
  return fileName
}

export async function getPaymentPdf(queries: FindPaymentFilters) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as FindPaymentFilters
  try {
     const response = await http.get("api/export/funding/pdf", {
      params: filtered,
      responseType: "blob"
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = getFileName(response, "pdf")
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch(error) {
    console.error(error);
  }
}

export async function getPaymentCsv(queries: FindPaymentFilters) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as FindPaymentFilters
  try {
     const response = await http.get("api/export/funding/csv", {
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

export async function getPaymentXlsx(queries: FindPaymentFilters) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as FindPaymentFilters
  try {
     const response = await http.get("api/export/funding/xlsx", {
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
