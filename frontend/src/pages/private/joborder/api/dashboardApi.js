import api from "@/lib/api";

export const dashboardAPI = {
  getDashboardOverview: async (timeframe, year, month, week) => {
    // Build query parameters
    const params = new URLSearchParams();
    if (timeframe) params.append("timeframe", timeframe);
    if (year) params.append("year", year);
    if (month) params.append("month", month);
    if (week) params.append("week", week);
    
    const queryString = params.toString();
    const url = `/dashboard/overview${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  }
}; 