import type { PageBasedPagination } from "./baseTypes";

export type SiteType = {
  id: string;
  name: string;
  owner: string;
  contact: string;
  address: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  contractors: {id: string, name: string, disnegagedAt: Date | null}[];
};

export type GetSitesResponse = {
  data: SiteType[];
  pagination: PageBasedPagination;
};

export type CreateSiteType = {
  name: string;
  address: string;
  owner: string;
  contact: string;
};

export type SiteLookupType = {
  data: {
    id: string;
    name: string;
  }[];
};
