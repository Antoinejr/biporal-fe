export type CursorBasedPagination = {
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevCursor: Date | null;
  nextCursor: Date | null;
};

export type PageBasedPagination = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PageDirection = "prev" | "next";
