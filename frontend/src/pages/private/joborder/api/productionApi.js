import api from "@/lib/api";

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

  getProductionStats: async (year, month) => {
    const response = await api.get("/school-uniform-productions/stats", {
      params: { year, month },
    });
    return response.data;
  },

  getRawMaterialsUsageStats: async (year, month, category, type) => {
    const response = await api.get("/school-uniform-productions/raw-materials-usage", {
      params: { year, month, category, type },
    });
    return response.data;
  },

  getMaterialUsageReport: async (startDate, endDate, category, type) => {
    const response = await api.get("/school-uniform-productions/material-usage-report", {
      params: { startDate, endDate, category, type },
    });
    return response.data;
  },

  getAllAcademicGownProductions: async (year) => {
    try {
      let url = '/academic-gown-productions';
      if (year) {
        url += `?year=${year}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await api.post("/auth/refresh-token");
          let url = '/academic-gown-productions';
          if (year) {
            url += `?year=${year}`;
          }
          const retryResponse = await api.get(url);
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }
      throw error;
    }
  },

  getAcademicGownProductionById: async (id) => {
    try {
      const response = await api.get(`/academic-gown-productions/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await api.post("/auth/refresh-token");
          const retryResponse = await api.get(`/academic-gown-productions/${id}`);
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }
      throw error;
    }
  },

  createAcademicGownProduction: async (data) => {
    try {
      const response = await api.post("/academic-gown-productions", data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await api.post("/auth/refresh-token");
          const retryResponse = await api.post("/academic-gown-productions", data);
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }
      if (error.response?.data?.inventoryIssues) {
        return error.response.data;
      }
      throw error;
    }
  },

  updateAcademicGownProduction: async (id, data) => {
    try {
      const response = await api.put(`/academic-gown-productions/${id}`, data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await api.post("/auth/refresh-token");
          const retryResponse = await api.put(`/academic-gown-productions/${id}`, data);
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }
      throw error;
    }
  },

  deleteAcademicGownProduction: async (id) => {
    try {
      const response = await api.delete(`/academic-gown-productions/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await api.post("/auth/refresh-token");
          const retryResponse = await api.delete(`/academic-gown-productions/${id}`);
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }
      throw error;
    }
  },

  getAcademicGownProductionStats: async (year, month) => {
    try {
      const response = await api.get("/academic-gown-productions/stats", {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await api.post("/auth/refresh-token");
          const retryResponse = await api.get("/academic-gown-productions/stats", {
            params: { year, month }
          });
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }
      throw error;
    }
  },

  getAcademicGownMaterialsUsageStats: async (year, month, category, type) => {
    try {
      const response = await api.get("/academic-gown-productions/raw-materials-usage", {
        params: { year, month, category, type }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await api.post("/auth/refresh-token");
          const retryResponse = await api.get("/academic-gown-productions/raw-materials-usage", {
            params: { year, month, category, type }
          });
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }
      throw error;
    }
  },

  getAcademicGownMaterialUsageReport: async (startDate, endDate, category, type) => {
    try {
      const response = await api.get("/academic-gown-productions/material-usage-report", {
        params: { startDate, endDate, category, type }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await api.post("/auth/refresh-token");
          const retryResponse = await api.get("/academic-gown-productions/material-usage-report", {
            params: { startDate, endDate, category, type }
          });
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }
      throw error;
    }
  },

  getAcademicGownYearlyStats: async (year) => {
    try {
      const response = await api.get("/academic-gown-productions/stats", {
        params: { year }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await api.post("/auth/refresh-token");
          const retryResponse = await api.get("/academic-gown-productions/stats", {
            params: { year }
          });
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }
      throw error;
    }
  }
};
