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
};
