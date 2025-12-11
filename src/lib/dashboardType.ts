import type { CursorBasedPagination } from "./baseTypes";

export type ActivitiyLog = {
  id: string;
  firstName: string;
  lastName: string;
  lagId: string;
  isRejected: boolean;
  isOutOfOrder: boolean;
  action: Action;
  category: Category;
  createdAt: Date;
  destination: string;
  tokenId: string;
};

export type ActivityLogResponse = {
  data: ActivitiyLog[];
  pagination: CursorBasedPagination;
};

export type Action = "IN" | "OUT";

export type Category =
  | "RESIDENT"
  | "WORKER"
  | "DEPENDENT"
  | "SUPERVISOR"
  | "ARTISAN";
