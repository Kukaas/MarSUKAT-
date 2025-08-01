import { authAPI } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Custom hook for fetching data with caching
export const useDataFetching = (queryKey, apiFunction, options = {}) => {
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      return await apiFunction();
    },
    ...options,
  });
};

// Custom hook for mutations (create, update, delete) with cache invalidation
export const useDataMutation = (queryKey, apiFunction, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await apiFunction(data);
    },
    onSuccess: () => {
      // Invalidate and refetch the related query
      queryClient.invalidateQueries([queryKey]);
    },
    ...options,
  });
};

// Specific logout mutation hook
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useDataMutation(
    'auth',
    authAPI.logout,
    {
      onSuccess: () => {
        // Clear all queries from the cache on logout
        queryClient.clear();
      },
    }
  );
};