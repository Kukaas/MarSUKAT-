import api from "@/lib/api";

export const inventoryAPI = {
  getAllRawMaterialInventory: async () => {
    const response = await api.get("/raw-material-inventory");
    return response.data;
  },

  getRawMaterialInventoryById: async (id) => {
    const response = await api.get(`/raw-material-inventory/${id}`);
    return response.data;
  },

  getRawMaterialInventoryByCategory: async (category) => {
    const response = await api.get(
      `/raw-material-inventory/category/${category}`
    );
    return response.data;
  },

  createRawMaterialInventory: async (data) => {
    const response = await api.post("/raw-material-inventory", data);
    return response.data;
  },

  updateRawMaterialInventory: async (id, data) => {
    const response = await api.put(`/raw-material-inventory/${id}`, data);
    return response.data;
  },

  deleteRawMaterialInventory: async (id) => {
    const response = await api.delete(`/raw-material-inventory/${id}`);
    return response.data;
  },

  getMaterialUsageStats: async (materialId, year, month) => {
    // First, get the material details
    const material = await inventoryAPI.getRawMaterialInventoryById(materialId);
    
    // Then fetch usage stats with the category and type
    if (material && material.rawMaterialType) {
      const response = await api.get("/school-uniform-productions/raw-materials-usage", {
        params: {
          year,
          month,
          category: material.category,
          type: material.rawMaterialType.name
        }
      });
      return {
        material,
        usageStats: response.data
      };
    }
    throw new Error("Could not retrieve material details");
  },
  
  getMaterialForecast: async (materialId, days = 30) => {
    // Get the material details
    const material = await inventoryAPI.getRawMaterialInventoryById(materialId);
    
    if (material && material.rawMaterialType) {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Format dates
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Fetch usage report with the specific material
      const response = await api.get("/school-uniform-productions/material-usage-report", {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          category: material.category,
          type: material.rawMaterialType.name
        }
      });
      
      return {
        material,
        forecastData: response.data
      };
    }
    throw new Error("Could not retrieve material details");
  },

  getAllUniformInventory: async () => {
    const response = await api.get("/uniform-inventory");
    return response.data;
  },

  getUniformInventoryById: async (id) => {
    const response = await api.get(`/uniform-inventory/${id}`);
    return response.data;
  },

  getUniformInventoryByLevel: async (level) => {
    const response = await api.get(`/uniform-inventory/level/${level}`);
    return response.data;
  },

  createUniformInventory: async (data) => {
    const response = await api.post("/uniform-inventory", data);
    return response.data;
  },

  updateUniformInventory: async (id, data) => {
    const response = await api.put(`/uniform-inventory/${id}`, data);
    return response.data;
  },

  deleteUniformInventory: async (id) => {
    const response = await api.delete(`/uniform-inventory/${id}`);
    return response.data;
  },

  // Academic Gown Inventory API functions
  getAllAcademicGownInventory: async () => {
    const response = await api.get("/academic-gown-inventory");
    return response.data;
  },

  getAcademicGownInventoryById: async (id) => {
    const response = await api.get(`/academic-gown-inventory/${id}`);
    return response.data;
  },

  createAcademicGownInventory: async (data) => {
    const response = await api.post("/academic-gown-inventory", data);
    return response.data;
  },

  updateAcademicGownInventory: async (id, data) => {
    const response = await api.put(`/academic-gown-inventory/${id}`, data);
    return response.data;
  },

  deleteAcademicGownInventory: async (id) => {
    const response = await api.delete(`/academic-gown-inventory/${id}`);
    return response.data;
  },

  updateAcademicGownInventoryQuantity: async (id, data) => {
    const response = await api.patch(`/academic-gown-inventory/${id}/quantity`, data);
    return response.data;
  },

  getAcademicGownInventoryStats: async (params) => {
    const response = await api.get("/academic-gown-inventory/stats", { params });
    return response.data;
  },
};
