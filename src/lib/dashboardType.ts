import type { CursorBasedPagination, PageBasedPagination } from "./baseTypes";

export const LogStatusEnum = {
  STILL_IN: "STILL_IN",
  OVERSTAYED: "OVERSTAYED",
  EXITED: "EXITED",
};

export type LogStatus = (typeof LogStatusEnum)[keyof typeof LogStatusEnum];

export const AccessStatusEnum = {
  GRANTED: "GRANTED",
  REJECTED: "REJECTED",
  FLAGGED: "FLAGGED",
} as const;

export type AccessStatus =
  (typeof AccessStatusEnum)[keyof typeof AccessStatusEnum];

export type LogReport = {
  id: string;
  firstName: string;
  lastName: string;
  lagId: string;
  isRejected: boolean;
  isOutOfOrder: boolean;
  action: Action;
  category: Category;
  status: Status;
  tokenId: string;
  siteId: string;
  hasViolations: boolean;
  violationDetails: String | null;
  reason: string | null;
  siteName: string;
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

export type Status = "EXITED" | "NOT_LEFT" | "OVERSTAYED";

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
