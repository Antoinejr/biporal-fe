import type { Category } from "@/lib/activityLogsTypes";
import http from "@/lib/axiosClient";
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
