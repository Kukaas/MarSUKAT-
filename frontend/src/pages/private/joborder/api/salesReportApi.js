import api from "@/lib/api";

export const salesReportAPI = {
  getAllSalesReports: async () => {
    const response = await api.get("/sales-reports");
    return response.data;
  },

  getSalesReportById: async (id) => {
    const response = await api.get(`/sales-reports/${id}`);
    return response.data;
  },

  getMonthlySalesSummary: async (year, month) => {
    const response = await api.get("/sales-reports/summary/monthly", {
      params: { year, month },
    });
    return response.data;
  },

  getYearlySalesSummary: async (year) => {
    const response = await api.get("/sales-reports/summary/yearly", {
      params: { year },
    });
    return response.data;
  }
}; 