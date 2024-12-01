import { useRouter } from "next/router";

import { type PaginationState, PaginationOptions } from "@tanstack/react-table";
import {
  PageNumberCounters,
  PageNumberPagination,
} from "prisma-extension-pagination/dist/types";

interface UsePaginationReturn {
  limit: number;
  onPaginationChange: PaginationOptions["onPaginationChange"];
  pagination: PaginationState;
  skip: number;
}

export function useQueryPagination(
  meta: PageNumberPagination & PageNumberCounters,
): UsePaginationReturn {
  const { replace, query } = useRouter();
  const pageSize = Math.ceil(meta.totalCount / meta.pageCount);

  const currentPage = query.page ? parseInt(query.page as string) : 1;

  const onPaginationChange: (
    updated: PaginationState | ((old: PaginationState) => PaginationState),
  ) => void = (pagination) => {
    let nextPage: number;

    if (typeof pagination === "function") {
      nextPage =
        pagination({ pageIndex: currentPage - 1, pageSize }).pageIndex + 1;
    } else {
      nextPage = pagination.pageIndex + 1;
    }

    replace({ query: { ...query, page: nextPage } });
  };

  return {
    limit: pageSize,
    onPaginationChange,
    pagination: { pageSize, pageIndex: currentPage - 1 },
    skip: pageSize * (currentPage - 1),
  };
}
