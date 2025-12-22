import http from "@/lib/axiosClient";
import type {
  ContractorLookupType,
  CreateContractorType,
  GetContractorResponseType,
  GetOneContractorResponseType,
} from "@/lib/contractorTypes";

type GetContractorQuery = {
  page?: number;
  isActive?: boolean;
  search?: string;
};

export async function restoreContractor(id: string) {
  console.debug("Restoring contraction id: ", id);
  try {
    await http.patch(`api/contractor/restore/${id}`);
    return;
  } catch(error) {
    console.error(error);
    throw error;
  }
}

export async function deleteContractor(id: string) {
  console.debug(`Deleting contractor with id ${id}`);
  try {
    await http.delete(`/api/contractor/${id}`);
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function getOneContractor(id: string) {
  try {
    const response = await http.get<GetOneContractorResponseType>(`/api/contractor/${id}`);
    return response.data
  } catch(error) {
    console.error(error);
    throw error;
  }
}

export async function updateContractor(payload: {id: string, payload: Partial<CreateContractorType>}) {
  try {
    console.log("Sending out edit request: ", payload);
    await http.patch<void>(`/api/contractor/${payload.id}`, payload.payload);
    return;
  } catch(error) {
    console.error(error);
    throw error;
  }
}

export async function deactivateContractor(id: string) {
  try {
    await http.delete<void>(`/api/contractor/${id}`);
    return;
  } catch(error) {
    console.error(error);
    throw error;
  }
}

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
