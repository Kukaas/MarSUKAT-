import api from "@/lib/api";

export const accomplishmentReportAPI = {
  getAllAccomplishmentReports: async () => {
    const response = await api.get("/accomplishment-reports");
    return response.data;
  },

  getAccomplishmentReportById: async (id) => {
    const response = await api.get(`/accomplishment-reports/${id}`);
    return response.data;
  },

  createAccomplishmentReport: async (data) => {
    const response = await api.post("/accomplishment-reports", data);
    return response.data;
  },

  updateAccomplishmentReport: async (id, data) => {
    const response = await api.put(`/accomplishment-reports/${id}`, data);
    return response.data;
  },

  deleteAccomplishmentReport: async (id) => {
    const response = await api.delete(`/accomplishment-reports/${id}`);
    return response.data;
  },
};
