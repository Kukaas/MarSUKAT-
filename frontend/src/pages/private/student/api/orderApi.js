import api from "@/lib/api";

export const orderAPI = {
  getOrderById: async (id) => {
    const response = await api.get(`/student-orders/${id}`);
    return response.data;
  },

  createStudentOrder: async (data) => {
    const response = await api.post("/student-orders", data);
    return response.data;
  },

  updateStudentOrder: async (id, data) => {
    const response = await api.put(`/student-orders/${id}`, data);
    return response.data;
  },

  deleteStudentOrder: async (id) => {
    const response = await api.delete(`/student-orders/${id}`);
    return response.data;
  },

  getOrdersByUserId: async (userId) => {
    const response = await api.get(`/student-orders/user/${userId}`);
    return response.data;
  },

  addReceipt: async (orderId, data) => {
    const response = await api.put(
      `/student-orders/${orderId}/add-receipt`,
      data
    );
    return response.data;
  },
};
