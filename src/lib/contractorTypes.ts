import type { PageBasedPagination } from "./baseTypes";

export type ContractorType = {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
};

export type GetContractorResponseType = {
  data: ContractorType[];
  pagination: PageBasedPagination;
};

export type CreateContractorType = {
  name: string;
  phone: string;
  email: string;
  passcode: string;
};

export type ContractorLookupType = {
  data: {
    id: string;
    name: string;
  }[];
};
