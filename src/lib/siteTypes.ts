import type { PageBasedPagination } from "./baseTypes";

export type SiteType = {
  id: string;
  name: string;
  address: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  contractors: {name: string, disnegagedAt: Date | null}[]
};

export type GetSitesResponse = {
  data: SiteType[];
  pagination: PageBasedPagination;
};

export type CreateSiteType = {
  name: string;
  address: string;
};

export type SiteLookupType = {
  data: {
    id: string;
    name: string;
  }[];
};
