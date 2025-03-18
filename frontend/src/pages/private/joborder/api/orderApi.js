import api from "@/lib/api";

export const jobOrderAPI = {
  getAllOrders: async () => {
    const response = await api.get("/student-orders");
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/student-orders/${id}`);
    return response.data;
  },

  updateOrder: async (id, data) => {
    const response = await api.put(`/student-orders/${id}`, data);
    return response.data;
  },

  verifyReceipt: async (id, verified) => {
    const response = await api.put(`/student-orders/${id}`, {
      "receipt.isVerified": verified,
    });
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/student-orders/${id}`);
    return response.data;
  },

  rejectOrder: async (id, reason) => {
    const response = await api.put(`/student-orders/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  addOrderItemsAndMeasure: async (id, orderItems) => {
    const response = await api.put(`/student-orders/${id}/measure`, {
      orderItems,
    });
    return response.data;
  },
};
