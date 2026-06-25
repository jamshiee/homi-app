import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { propertiesApi, PropertyFilter } from "@api/properties.api";
import { ApiResponse, PropertyDto } from "@api/types";
import { useAuthStore } from "@/store/auth.store";
import { AxiosResponse } from "axios";

export const QUERY_KEYS = {
  feed: (filters: PropertyFilter, userId?: string | null) =>
    ["properties", "feed", filters, userId ?? "guest"] as const,
  featured: (userId?: string | null, district?: string, locality?: string) =>
    ["properties", "featured", userId ?? "guest", district ?? "", locality ?? ""] as const,
  detail: (id: string) => ["properties", id] as const,
  related: (id: string) => ["properties", id, "related"] as const,
  saved: () => ["properties", "saved"] as const,
};

function readPropertyIsSaved(
  queryClient: QueryClient,
  propertyId: string,
): boolean {
  for (const [, data] of queryClient.getQueriesData({
    queryKey: ["properties", "feed"],
  })) {
    const pages = (data as any)?.pages ?? [];
    for (const page of pages) {
      const match = (page?.data?.data as PropertyDto[] | undefined)?.find(
        (p) => p.id === propertyId,
      );
      if (match) return match.isSaved ?? false;
    }
  }

  for (const [, data] of queryClient.getQueriesData({
    queryKey: ["properties", "featured"],
  })) {
    const match = ((data as any)?.data?.data as PropertyDto[] | undefined)?.find(
      (p) => p.id === propertyId,
    );
    if (match) return match.isSaved ?? false;
  }

  const savedItems = (queryClient.getQueryData(QUERY_KEYS.saved()) as any)?.data
    ?.data as PropertyDto[] | undefined;
  if (savedItems?.some((p) => p.id === propertyId)) return true;

  return false;
}

function patchPropertyIsSaved(
  queryClient: QueryClient,
  propertyId: string,
  isSaved: boolean,
) {
  queryClient.setQueriesData<any>(
    { queryKey: ["properties", "feed"], exact: false },
    (old: any) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          data: {
            ...page.data,
            data: Array.isArray(page.data?.data)
              ? page.data.data.map((p: PropertyDto) =>
                  p.id === propertyId ? { ...p, isSaved } : p,
                )
              : page.data?.data,
          },
        })),
      };
    },
  );

  queryClient.setQueriesData<any>(
    { queryKey: ["properties", "featured"], exact: false },
    (old: any) => {
      if (!old?.data?.data) return old;
      return {
        ...old,
        data: {
          ...old.data,
          data: Array.isArray(old.data.data)
            ? old.data.data.map((p: PropertyDto) =>
                p.id === propertyId ? { ...p, isSaved } : p,
              )
            : old.data.data,
        },
      };
    },
  );

  queryClient.setQueryData(QUERY_KEYS.saved(), (old: any) => {
    const items = old?.data?.data;
    if (!Array.isArray(items)) return old;
    const nextItems = isSaved
      ? items.map((p: PropertyDto) =>
          p.id === propertyId ? { ...p, isSaved: true } : p,
        )
      : items.filter((p: PropertyDto) => p.id !== propertyId);
    return {
      ...old,
      data: {
        ...old.data,
        data: nextItems,
      },
    };
  });
}

export function usePropertyFeed(filters: Omit<PropertyFilter, "page">) {
  const userId = useAuthStore((s) => s.user?.id);
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.feed(filters, userId),
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

export function useFeaturedProperties(params?: {
  district?: string;
  locality?: string;
}) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: QUERY_KEYS.featured(userId, params?.district, params?.locality),
    queryFn: () => propertiesApi.getFeatured(params),
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

export function useMyListings(filters: Omit<PropertyFilter, "page">) {
  return useInfiniteQuery({
    queryKey: ["properties", "mine", filters],
    queryFn: ({ pageParam = 1 }) =>
      propertiesApi.getMine({ ...filters, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const meta = (lastPage.data as ApiResponse<any>).meta;
      if (!meta) return undefined;
      const { page, totalPages } = meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useToggleSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => propertiesApi.toggleSave(propertyId),

    onMutate: async (propertyId: string) => {
      // Cancel in-flight queries
      await Promise.all([
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.saved() }),
        queryClient.cancelQueries({ queryKey: ["properties", "feed"] }),
        queryClient.cancelQueries({ queryKey: ["properties", "featured"] }),
      ]);

      // Snapshot for rollback
      const previousSaved = queryClient.getQueryData(QUERY_KEYS.saved());
      const previousFeed = queryClient.getQueriesData({
        queryKey: ["properties", "feed"],
      });
      const previousFeatured = queryClient.getQueriesData({
        queryKey: ["properties", "featured"],
      });

      // ── Optimistically flip isSaved across feed, featured, and saved caches ─
      patchPropertyIsSaved(
        queryClient,
        propertyId,
        !readPropertyIsSaved(queryClient, propertyId),
      );

      return { previousSaved, previousFeed, previousFeatured };
    },

    onError: (_err, _propertyId, context) => {
      if (context?.previousSaved !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.saved(), context.previousSaved);
      }
      context?.previousFeed?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.previousFeatured?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      Toast.show({
        type: "error",
        text1: "Could not update saved status",
        text2: "Please try again",
      });
    },

    onSuccess: (res, propertyId) => {
      const saved = (res as AxiosResponse<ApiResponse<{ saved: boolean }>>).data
        ?.data?.saved;
      if (typeof saved === "boolean") {
        patchPropertyIsSaved(queryClient, propertyId, saved);
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.saved() });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => propertiesApi.delete(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["properties", "featured"] });
      queryClient.invalidateQueries({ queryKey: ["properties", "feed"] });
      Toast.show({ type: "success", text1: "Listing deleted" });
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Could not delete listing" });
    },
  });
}
