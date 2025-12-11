import http from "@/lib/axiosClient";
import type {
  ContractorLookupType,
  CreateContractorType,
  GetContractorResponseType,
} from "@/lib/contractorTypes";

type GetContractorQuery = {
  page?: number;
  isActive?: boolean;
  search?: string;
};

export const getContractors = async (payload: GetContractorQuery) => {
  let data: GetContractorQuery = {};
  if (payload.page) {
    data.page = payload.page;
  }
  if (payload.isActive !== undefined) {
    data.isActive = payload.isActive;
  }
  if (payload.search && payload.search !== "") {
    data.search = payload.search;
  }
  console.log("Get contractor request...", data);
  try {
    const response = await http.get<GetContractorResponseType>(
      "/api/contractor",
      {
        params: data,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to retrieve contractors", { cause: error });
    throw error;
  }
};

export const createContractor = async (payload: CreateContractorType) => {
  try {
    console.log("Post request sent...", payload);
    await http.post("/api/contractor", payload);
    return;
  } catch (error) {
    console.error("Failed to create contractor", { cause: error });
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
    console.error("Failed to get contractor lookup", { cause: error });
    throw error;
  }
}
