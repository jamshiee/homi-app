import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { propertiesApi, PropertyFilter } from '@api/properties.api';
import { ApiResponse, PropertyDto } from '@api/types';

export const QUERY_KEYS = {
  feed: (filters: PropertyFilter) => ['properties', 'feed', filters] as const,
  featured: () => ['properties', 'featured'] as const,
  detail: (id: string) => ['properties', id] as const,
  related: (id: string) => ['properties', id, 'related'] as const,
  saved: () => ['properties', 'saved'] as const,
};

export function usePropertyFeed(filters: Omit<PropertyFilter, 'page'>) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.feed(filters),
    queryFn: ({ pageParam = 1 }) =>
      propertiesApi.getFeed({ ...filters, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data.meta;
      if (!meta) return undefined;
      const { page, totalPages } = meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useFeaturedProperties() {
  return useQuery({
    queryKey: QUERY_KEYS.featured(),
    queryFn: () => propertiesApi.getFeatured(),
  });
}

export function usePropertyDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => propertiesApi.getById(id),
    enabled: !!id,
  });
}

export function useRelatedProperties(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.related(id),
    queryFn: () => propertiesApi.getRelated(id),
    enabled: !!id,
  });
}

export function useSavedProperties() {
  return useQuery({
    queryKey: QUERY_KEYS.saved(),
    queryFn: () => propertiesApi.getSaved(),
  });
}

export function useToggleSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => propertiesApi.toggleSave(propertyId),

    onMutate: async (propertyId: string) => {
      // Cancel in-flight queries for saved list
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.saved() });

      // Snapshot previous saved list
      const previousSaved = queryClient.getQueryData(QUERY_KEYS.saved());

      // Optimistically update saved list
      queryClient.setQueryData(
        QUERY_KEYS.saved(),
        (old: ApiResponse<PropertyDto[]> | undefined) => {
          if (!old) return old;
          const items = (old.data as PropertyDto[]) ?? [];
          const alreadySaved = items.some((p) => p.id === propertyId);
          return {
            ...old,
            data: alreadySaved
              ? items.filter((p) => p.id !== propertyId)
              : items, // new saves appear after refetch
          };
        },
      );

      return { previousSaved };
    },

    onError: (_err, _propertyId, context) => {
      // Rollback
      if (context?.previousSaved !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.saved(), context.previousSaved);
      }
      Toast.show({
        type: 'error',
        text1: 'Could not update saved status',
        text2: 'Please try again',
      });
    },

    onSuccess: (_data, _propertyId) => {
      // Refetch to get accurate server state
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.saved() });
    },
  });
}
