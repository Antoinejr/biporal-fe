import type { CursorBasedPagination, PageBasedPagination } from "./baseTypes";

export type LogReport = {
  id: string;
  firstName: string;
  lastName: string;
  lagId: string | null;
  isRejected: boolean;
  isOutOfOrder: boolean;
  action: Action;
  category: Category;
  isLate: boolean;
  hasNotLeft: boolean;
  tokenId: string;
  siteId: string;
  siteName: string;
  reason: string | null;
  createdAt: Date;
};

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
  site: string;
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

export type ReportLogResponse = {
  data: LogReport[];
  pagination: PageBasedPagination;
};
