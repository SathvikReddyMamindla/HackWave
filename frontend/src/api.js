import fallbackData from "./data.json";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function getJSON(path) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`API request to ${path} failed, falling back to local dataset:`, err);
  }

  // Graceful fallback for static deployments
  if (path === "/health") {
    return {
      status: "ok",
      generated_at: fallbackData.overview.generated_at,
      equipment_count: fallbackData.overview.total_equipment,
    };
  }
  if (path === "/overview") {
    return fallbackData.overview;
  }
  if (path === "/equipment") {
    return fallbackData.overview.equipment || [];
  }
  if (path.startsWith("/equipment/") && path.endsWith("/report")) {
    const id = path.replace("/equipment/", "").replace("/report", "");
    if (fallbackData.reports && fallbackData.reports[id]) {
      return fallbackData.reports[id];
    }
  }
  if (path.startsWith("/equipment/")) {
    const id = path.replace("/equipment/", "");
    if (fallbackData.equipment && fallbackData.equipment[id]) {
      return fallbackData.equipment[id];
    }
  }

  throw new Error(`Data not found for ${path}`);
}

export const api = {
  health: () => getJSON("/health"),
  overview: () => getJSON("/overview"),
  equipmentList: () => getJSON("/equipment"),
  equipmentDetail: (id) => getJSON(`/equipment/${id}`),
  equipmentReport: (id) => getJSON(`/equipment/${id}/report`),
};
