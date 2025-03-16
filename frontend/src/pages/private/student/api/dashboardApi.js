import api from "@/lib/api";

export const dashboardAPI = {
  // Get all active products
  getActiveProducts: async () => {
    const response = await api.get("/products/active");
    return response.data;
  },

  // Get current announcements (where end date is after current date)
  getCurrentAnnouncements: async () => {
    const response = await api.get("/announcements/current");
    return response.data;
  },
};
