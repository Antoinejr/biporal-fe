import type { Category } from "./activityLogsTypes";
import type { PageBasedPagination } from "./baseTypes";

export type Token = {
  id: string;
  fullName: string;
  lagId: string | null;
  expirationDate: Date;
  category: Category;
  createdAt: Date;
  person: { id: string } | null,
  supervisor: {
    id: string;
    fullName: string;
  } | null;
  site: {
    id: string;
    name: string;
  } | null
}

export type TokenResponse = {
  data: Token[];
  pagination: PageBasedPagination;
}
