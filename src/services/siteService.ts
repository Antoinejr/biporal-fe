import http from "@/lib/axiosClient";
import type {
  CreateSiteType,
  GetSitesResponse,
  SiteLookupType,
  SiteType,
} from "@/lib/siteTypes";

type GetSitesQuery = {
  page?: number;
  search?: string;
};

type CreateSiteEngagement = {
  siteId: string;
  contractorId: string;
};

export async function updateSite(payload: {id: string, payload: Partial<CreateSiteType>}) {
  try {
    await http.patch(`/api/site/${payload.id}`, payload.payload);
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findSite(id: string): Promise<SiteType | undefined>{
  try {
    console.log(id);
    const response = await http.get<SiteType>(`/api/site/${id}`);
    return response.data
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getSites(payload: GetSitesQuery) {
  try {
    let data: GetSitesQuery = {};
    if (payload.page) data.page = payload.page;
    if (payload.search) data.search = payload.search;

    const response = await http.get<GetSitesResponse>("/api/site", {
      params: data,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createSite(payload: CreateSiteType) {
  try {
    await http.post("/api/site", payload);
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function lookupSites() {
  try {
    const response = await http.get<SiteLookupType>("/api/site/lookup");
    const data = response.data.data.map((p) => ({
      name: p.name,
      value: p.id,
    }));
    return data;
  } catch (error) {
    console.error("Failed to get site lookup", { cause: error });
    throw error;
  }
}

export async function createSiteEngagement(payload: CreateSiteEngagement) {
  try {
    console.log("Submitting site-engagement request", { data: payload });
    await http.post("/api/site/site-engagement", payload);
    return;
  } catch (error) {
    console.error("Failed to create site engagement", { cause: error });
    throw error;
  }
}
