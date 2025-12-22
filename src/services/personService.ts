import type { Category } from "@/lib/activityLogsTypes";
import http from "@/lib/axiosClient";
import type {
  CreatePersonType,
  GetPersonsResponse,
  Person,
  ResidentLookupResponse,
} from "@/lib/personTypes";

type GetPersonQuery = {
  page?: number;
  isActive?: boolean;
  search?: string;
  category?: Category
};

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
export async function extendToken(payload: {id: string, payload: {length: number}}): Promise<void> {
  try {
    await http.patch(`/api/person/refresh/${payload.id}`, payload.payload);
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function revokeToken(id: string): Promise<void> {
  try {
    await http.patch(`/api/person/revoke/${id}`);
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updatePerson(payload: {id: string, payload: Partial<CreatePersonType>}) {
  try {
    await http.patch(`/api/person/${payload.id}`, payload.payload)
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
  } catch(error) {
    console.error(error);
    throw error
  }
}

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
  if (payload.category) {
    data.category = payload.category
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
