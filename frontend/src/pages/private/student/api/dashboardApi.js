import api from "@/lib/api";

export const dashboardAPI = {
  // Get all active products
  getActiveProducts: async () => {
    const response = await api.get("/products/active");
    return response.data;
  },
};
