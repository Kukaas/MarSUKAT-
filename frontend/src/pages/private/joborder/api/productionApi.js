import api from "@/lib/api";
import axios from "axios";

export const productionAPI = {
  getAllSchoolUniformProductions: async () => {
    const response = await api.get("/school-uniform-productions");
    return response.data;
  },

  getSchoolUniformProductionById: async (id) => {
    const response = await api.get(`/school-uniform-productions/${id}`);
    return response.data;
  },

  createSchoolUniformProduction: async (data) => {
    const response = await api.post("/school-uniform-productions", data);
    return response.data;
  },

  updateSchoolUniformProduction: async (id, data) => {
    const response = await api.put(`/school-uniform-productions/${id}`, data);
    return response.data;
  },

  deleteSchoolUniformProduction: async (id) => {
    const response = await api.delete(`/school-uniform-productions/${id}`);
    return response.data;
  },
};
