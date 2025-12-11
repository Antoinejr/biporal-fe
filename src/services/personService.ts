import http from "@/lib/axiosClient";
import type {
  CreatePersonType,
  GetPersonsResponse,
  ResidentLookupResponse,
} from "@/lib/personTypes";

type GetPersonQuery = {
  page?: number;
  isActive?: boolean;
  search?: string;
};

export async function getPersons(payload: GetPersonQuery) {
  let data: GetPersonQuery = {};
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
    console.log("Creating new person...", payload);
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
