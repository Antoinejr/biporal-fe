import http from "@/lib/axiosClient";
import type { PageBasedPagination } from "@/lib/baseTypes";

export interface TokensActiveToday {
  id: string;
  firstName: string;
  lastName: string;
  supervisorName: string;
  lagId: string | null;
}

interface BlockListQuery {
  page?: number;
  search?: string;
}

interface BlockListEntriesResponse {
  data: BlockListEntry[];
  metadata: PageBasedPagination;
}

interface WarningResponse {
  limit: number;
}

export interface AddToBlocklist {
  firstName: string;
  lastName: string;
  lagId?: string;
  tokenId?: string;
  notes?: string;
}

export interface BlockListEntry {
  id: string;
  firstName: string;
  lastName: string;
  lagId: string;
  timesBlocked: number;
}

export interface Note {
  id: string;
  reason: string;
  createdAt: Date;
}

export async function fetchEntries(query: BlockListQuery) {
  const filtered = Object.fromEntries(
    Object.entries(query).filter(
      ([_, value]) => value !== undefined && value !== "",
    ),
  ) as BlockListQuery;
  try {
    const response = await http.get<BlockListEntriesResponse>(
      "api/moderation",
      {
        params: filtered,
      },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function blockAccess(payload: AddToBlocklist) {
  const filtered = Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) => value !== undefined && value !== "",
    ),
  ) as AddToBlocklist;
  try {
    await http.post<void>("api/moderation", filtered);
    return;
  } catch (err) {
    throw err;
  }
}

export async function retrieveNotes({ id }: { id: string }) {
  try {
    const response = await http.get<{ data: Note[] }>(
      `api/moderation/notes/${id}`,
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function removeFromBlocklist({ lagId }: { lagId: string }) {
  try {
    await http.patch("api/moderation/delete", { lagId });
    return;
  } catch (err) {
    throw err;
  }
}

export async function addNote({
  lagId,
  notes,
}: {
  lagId: string;
  notes: string;
}) {
  try {
    await http.patch("api/moderation/note", { lagId, notes });
  } catch (err) {
    throw err;
  }
}

export async function updateWarning({ limit }: { limit: number }) {
  try {
    await http.patch("api/moderation/warning", { limit });
  } catch (err) {
    throw err;
  }
}

export async function getWarning() {
  try {
    const response = await http.get<WarningResponse>("api/moderation/warning");
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function findTokensActiveToday(query: { search: string }) {
  try {
    const response = await http.get<{ data: TokensActiveToday[] }>(
      "api/tokens/light",
      {
        params: query,
      },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}
