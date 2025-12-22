import type { PageBasedPagination } from "./baseTypes";

export type GetOneContractorResponseType = {
  data: {
    contractor: {
      id: string,
      name: string,
      phone: string,
      email: string
      deletedAt: Date | null;
    } ,
    sites: ({
      id: string,
      name: string,
      balance: number,
      disengagedAt: Date | null
    })[],
    supervisors: ({
      id: string,
      firstName: string,
      lastName: string,
      lagId: string | null,
      disengagedAt: null,
      siteName: string
    })[],
  }
}

export type ContractorType = {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
  deletedAt: Date | null;
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
