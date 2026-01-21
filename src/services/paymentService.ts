import http from "@/lib/axiosClient";
import type { PageBasedPagination } from "@/lib/baseTypes";
import type { ContractorType } from "@/lib/contractorTypes";
import type { SiteType } from "@/lib/siteTypes";

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

export async function getPaymentPdf(queries: FindPaymentFilters) {
  const filtered = Object.fromEntries(
    Object.entries(queries).filter(
      ([_, value]) => value !== undefined && value !== ""
    ),
  ) as FindPaymentFilters
  try {
     const response = await http.get("api/export/download/funding", {
      params: filtered,
      responseType: "blob"
    });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.download = `funding_report_${new Date().toLocaleDateString("en-NG")}.pdf`
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch(error) {
    console.error(error);
  }
}
