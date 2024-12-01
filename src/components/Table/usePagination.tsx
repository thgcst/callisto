import { useState } from "react";

import { type PaginationState } from "@tanstack/react-table";

interface UsePaginationParams {
  /**
   * Initial pagination state
   *
   * @defaultValue `{ pageIndex: 0, pageSize: 10 }`
   */
  initialValues?: Partial<PaginationState>;
}

interface UsePaginationReturn {
  limit: number;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
  pagination: PaginationState;
  skip: number;
}

const defaultValues = {
  initialValues: {
    pageIndex: 0,
    pageSize: 10,
  },
} satisfies Required<UsePaginationParams>;

export function usePagination({
  initialValues,
}: UsePaginationParams = defaultValues): UsePaginationReturn {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialValues?.pageIndex ?? 0,
    pageSize: initialValues?.pageSize ?? 10,
  });
  const { pageSize, pageIndex } = pagination;

  return {
    limit: pageSize,
    onPaginationChange: setPagination,
    pagination,
    skip: pageSize * pageIndex,
  };
}
