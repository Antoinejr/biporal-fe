import type { PolicyType, RateType } from "@/lib/adminTypes";
import http from "@/lib/axiosClient";

export async function findPolicy() {
  try {
    const response = await http.get<PolicyType[]>("/api/admin/policy")
    return response.data;
  } catch(error) {
    console.error(error);
    throw error;
  }
}

export async function findRate() {
  try {
    const response = await http.get<RateType>("/api/admin/rate");
    return response.data;
  } catch(error) {
    console.error(error);
    throw error;
  }
}

export async function updatePolicy(payload: Omit<PolicyType, "id">) {
  console.log(payload);
  try {
    await http.put("/api/admin/policy", payload);
    return;
  } catch(error) {
    console.error(error);
    throw error;
  }
}

export async function updateRate(payload: {cost: number}) {
  try {
    console.log(payload);
    await http.put("api/admin/rate", payload);
    return;
  } catch(error) {
    console.error(error);
    throw error;
  }
}
