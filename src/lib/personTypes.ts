import type { Category } from "./activityLogsTypes";
import type { PageBasedPagination } from "./baseTypes";

export type CreatePersonType = {
  firstName: string;
  lastName: string;
  mobile: string;
  address: string;
  lagId?: string;
  passcode?: string;
  category: Category;
  residentId?: string;
  employerId?: string;
  durationOfStay: number;
};

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  address: string;
  lagId: string | null;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  residentId: string;
};

export type GetPersonsResponse = {
  data: Person[];
  pagination: PageBasedPagination;
};

export type ResidentLookupResponse = {
  data: {
    id: string;
    fullName: string;
  }[];
};
