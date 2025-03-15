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
};
