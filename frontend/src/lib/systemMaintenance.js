import api from "./api";

/**
 * System Maintenance API functions for managing levels and departments
 */
export const systemMaintenanceAPI = {
  // Get all levels
  getAllLevels: async () => {
    try {
      const response = await api.get("/levels");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get level by ID
  getLevelById: async (id) => {
    try {
      const response = await api.get(`/levels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new level (Super Admin only)
  createLevel: async (levelData) => {
    try {
      const response = await api.post("/levels", levelData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update level (Super Admin only)
  updateLevel: async (id, levelData) => {
    try {
      // For updates, we only send the fields that can be updated
      const { level, description } = levelData;
      const response = await api.put(`/levels/${id}`, { level, description });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete level (Super Admin only)
  deleteLevel: async (id) => {
    try {
      const response = await api.delete(`/levels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Department Management API functions
  getAllDepartments: async () => {
    try {
      const response = await api.get("/departments");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDepartmentById: async (id) => {
    try {
      const response = await api.get(`/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createDepartment: async (departmentData) => {
    try {
      const response = await api.post("/departments", departmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDepartment: async (id, departmentData) => {
    try {
      const { department, description } = departmentData;
      const response = await api.put(`/departments/${id}`, {
        department,
        description,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteDepartment: async (id) => {
    try {
      const response = await api.delete(`/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Category Management API functions
  getAllCategories: async () => {
    try {
      const response = await api.get("/categories");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await api.post("/categories", categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const { category } = categoryData;
      const response = await api.put(`/categories/${id}`, { category });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Unit Management API functions
  getAllUnits: async () => {
    try {
      const response = await api.get("/units");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUnitById: async (id) => {
    try {
      const response = await api.get(`/units/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createUnit: async (unitData) => {
    try {
      const response = await api.post("/units", unitData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUnit: async (id, unitData) => {
    try {
      const { unit } = unitData;
      const response = await api.put(`/units/${id}`, { unit });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUnit: async (id) => {
    try {
      const response = await api.delete(`/units/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Size Management API functions
  getAllSizes: async () => {
    try {
      const response = await api.get("/sizes");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSizeById: async (id) => {
    try {
      const response = await api.get(`/sizes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createSize: async (sizeData) => {
    try {
      const response = await api.post("/sizes", sizeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateSize: async (id, sizeData) => {
    try {
      const { size } = sizeData;
      const response = await api.put(`/sizes/${id}`, { size });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteSize: async (id) => {
    try {
      const response = await api.delete(`/sizes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Department Level Operations
  getAllDepartmentLevels: async () => {
    try {
      const response = await api.get("/department-levels");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  getActiveDepartmentLevels: async () => {
    try {
      const response = await api.get("/department-levels/active");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  createDepartmentLevel: async (data) => {
    try {
      const response = await api.post("/department-levels", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDepartmentLevel: async (id, data) => {
    try {
      const response = await api.put(`/department-levels/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDepartmentLevelStatus: async (id, data) => {
    try {
      const response = await api.patch(`/department-levels/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteDepartmentLevel: async (id) => {
    try {
      const response = await api.delete(`/department-levels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Price Management API functions
  getAllPrices: async () => {
    try {
      const response = await api.get("/prices");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPriceById: async (id) => {
    try {
      const response = await api.get(`/prices/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPrice: async (priceData) => {
    try {
      const response = await api.post("/prices", priceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePrice: async (id, priceData) => {
    try {
      const { price } = priceData;
      const response = await api.put(`/prices/${id}`, { price });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletePrice: async (id) => {
    try {
      const response = await api.delete(`/prices/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Raw Material Type Management API functions
  getAllRawMaterialTypes: async () => {
    try {
      const response = await api.get("/raw-material-types");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRawMaterialTypeById: async (id) => {
    try {
      const response = await api.get(`/raw-material-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createRawMaterialType: async (typeData) => {
    try {
      const response = await api.post("/raw-material-types", typeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateRawMaterialType: async (id, typeData) => {
    try {
      const { name, description } = typeData;
      const response = await api.put(`/raw-material-types/${id}`, {
        name,
        description,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteRawMaterialType: async (id) => {
    try {
      const response = await api.delete(`/raw-material-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default systemMaintenanceAPI;
