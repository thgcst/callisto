import { ChangeEvent } from "react";

import { useRouter } from "next/router";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useDebounceCallback } from "usehooks-ts";

import Input from "@/components/Input";
import Table from "@/components/Table";
import { useQueryPagination } from "@/components/Table/useQueryPagination";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";

import { IndividualsProps } from "./index.public";

interface DefaultTableProps {
  individuals: Exclude<IndividualsProps["individuals"], undefined>[0];
  meta: Exclude<IndividualsProps["individuals"], undefined>[1];
}

const DefaultTable: React.FC<DefaultTableProps> = ({ individuals, meta }) => {
  const { replace, query } = useRouter();
  const { pagination, onPaginationChange } = useQueryPagination(meta);
  const columnHelper = createColumnHelper<(typeof individuals)[number]>();

  const table = useReactTable({
    data: individuals,
    columns: [
      columnHelper.accessor("name", {
        header: "Nome",
      }),
      columnHelper.accessor("address.city", {
        header: "Cidade",
      }),
      columnHelper.accessor("address.state", {
        header: "Estado",
      }),
      columnHelper.accessor("createdAt", {
        header: "Criado em",
        cell: ({ getValue }) => (
          <>
            <div className="text-sm font-medium text-gray-900 lg:hidden">
              {dayToDDMMYYYY(getValue(), "/")}
            </div>
            <div className="hidden text-sm font-medium text-gray-900 lg:block">
              {dayToLocaleString(getValue())}
            </div>
          </>
        ),
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onPaginationChange,
    pageCount: meta.pageCount,
    rowCount: meta.totalCount,
    state: {
      pagination,
    },
  });

  const onSearchChange = useDebounceCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) {
        delete query.search;
        return replace({ query });
      }

      replace({ query: { ...query, search: e.target.value || undefined } });
    },
    500,
  );

  return (
    <div className="space-y-4">
      <div className="max-w-80">
        <Input
          label="Busca"
          onChange={onSearchChange}
          defaultValue={query.search}
        />
      </div>
      <Table table={table} pagination />
    </div>
  );
};

export default DefaultTable;
