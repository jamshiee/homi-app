import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { propertiesApi, PropertyFilter } from '@api/properties.api';

export const QUERY_KEYS = {
  feed: (filters: PropertyFilter) => ['properties', 'feed', filters] as const,
  featured: () => ['properties', 'featured'] as const,
  detail: (id: string) => ['properties', id] as const,
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.saved() }),
  });
}
