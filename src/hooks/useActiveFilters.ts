import { useFilterStore } from "@store/filter.store";
import { TransactionTypeFilter } from "@/common/enums/transaction-type-filter.enum";
import { SortOptionEnum } from "@/common/enums/sort-option-filter.enum";
import { formatPrice } from "@utils/price";

export interface ActiveFilter {
  id: string;
  label: string;
  clear: () => void;
}

export function useActiveFilters() {
  const filterState = useFilterStore();
  const { setFilter } = filterState;
  const activeFilters: ActiveFilter[] = [];

  // Property Type
  if (filterState.type && filterState.type !== "all") {
    const typeMap: Record<string, string> = {
      land: "Land/Plot",
      house: "House",
      building: "Building",
      hotel: "Hotel/PG",
    };
    activeFilters.push({
      id: "type",
      label: typeMap[filterState.type] || filterState.type,
      clear: () => setFilter({ type: "all" }),
    });
  }

  // District
  if (filterState.district) {
    activeFilters.push({
      id: "district",
      label: filterState.district,
      clear: () => setFilter({ district: undefined }),
    });
  }

  // Transaction Type
  if (
    filterState.transactionType &&
    filterState.transactionType !== TransactionTypeFilter.ALL
  ) {
    const txMap: Record<string, string> = {
      BUY: "Buy",
      RENT: "Rent",
      LEASE: "Lease",
    };
    activeFilters.push({
      id: "transactionType",
      label: txMap[filterState.transactionType] || filterState.transactionType,
      clear: () => setFilter({ transactionType: TransactionTypeFilter.ALL }),
    });
  }

  // Price Range
  if (
    filterState.minPrice !== undefined ||
    filterState.maxPrice !== undefined
  ) {
    let label = "";
    if (
      filterState.minPrice !== undefined &&
      filterState.maxPrice !== undefined
    ) {
      label = `${formatPrice(String(filterState.minPrice))} - ${formatPrice(String(filterState.maxPrice))}`;
    } else if (filterState.minPrice !== undefined) {
      label = `≥ ${formatPrice(String(filterState.minPrice))}`;
    } else if (filterState.maxPrice !== undefined) {
      label = `≤ ${formatPrice(String(filterState.maxPrice))}`;
    }
    activeFilters.push({
      id: "price",
      label,
      clear: () => setFilter({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  // Bedrooms (House)
  if (filterState.bedrooms !== undefined) {
    activeFilters.push({
      id: "bedrooms",
      label: `${filterState.bedrooms} BHK`,
      clear: () => setFilter({ bedrooms: undefined }),
    });
  }

  // Bathrooms (House)
  if (filterState.bathrooms !== undefined) {
    activeFilters.push({
      id: "bathrooms",
      label: `${filterState.bathrooms} Bath`,
      clear: () => setFilter({ bathrooms: undefined }),
    });
  }

  // Furnishing Status (House)
  if (filterState.furnishingStatus !== undefined) {
    const furnishingMap: Record<string, string> = {
      FULLY_FURNISHED: "Fully Furnished",
      SEMI_FURNISHED: "Semi Furnished",
      UN_FURNISHED: "Unfurnished",
    };
    activeFilters.push({
      id: "furnishingStatus",
      label:
        furnishingMap[filterState.furnishingStatus] ||
        filterState.furnishingStatus,
      clear: () => setFilter({ furnishingStatus: undefined }),
    });
  }

  // Area Range (Land)
  if (filterState.minArea !== undefined || filterState.maxArea !== undefined) {
    const unit = filterState.areaUnit || "cents";
    let label = "";
    if (
      filterState.minArea !== undefined &&
      filterState.maxArea !== undefined
    ) {
      label = `${filterState.minArea} - ${filterState.maxArea} ${unit}`;
    } else if (filterState.minArea !== undefined) {
      label = `≥ ${filterState.minArea} ${unit}`;
    } else if (filterState.maxArea !== undefined) {
      label = `≤ ${filterState.maxArea} ${unit}`;
    }
    activeFilters.push({
      id: "area",
      label,
      clear: () => setFilter({ minArea: undefined, maxArea: undefined }),
    });
  }

  // Sort Option
  if (filterState.sort && filterState.sort !== SortOptionEnum.Newest) {
    const sortMap: Record<string, string> = {
      [SortOptionEnum.Relevance]: "Relevance",
      [SortOptionEnum.PriceAsc]: "Price: Low to High",
      [SortOptionEnum.PriceDesc]: "Price: High to Low",
    };
    activeFilters.push({
      id: "sort",
      label: sortMap[filterState.sort] || "Sort Active",
      clear: () => setFilter({ sort: SortOptionEnum.Newest }),
    });
  }

  return activeFilters;
}
