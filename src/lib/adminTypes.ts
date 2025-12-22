import type { Category } from "./activityLogsTypes"

export type PolicyType = {
  id: string;
  role: Category;
  entryTime: string;
  exitTime: string;
}

export type RateType = {
  id: string;
  rate: number;
  createdAt: Date;
  updated: Date;
}
