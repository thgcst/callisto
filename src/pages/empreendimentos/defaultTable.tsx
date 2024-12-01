import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import Table from "@/components/Table";
import { useQueryPagination } from "@/components/Table/useQueryPagination";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";

import { CompaniesProps } from "./index.public";

interface DefaultTableProps {
  companies: Exclude<CompaniesProps["companies"], undefined>[0];
  meta: Exclude<CompaniesProps["companies"], undefined>[1];
}

const DefaultTable: React.FC<DefaultTableProps> = ({ companies, meta }) => {
  const { pagination, onPaginationChange } = useQueryPagination(meta);
  const columnHelper = createColumnHelper<(typeof companies)[number]>();

  const table = useReactTable({
    data: companies,
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
      columnHelper.accessor("_count.employees", {
        header: "Nº de Funcionários",
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

  return <Table table={table} pagination />;
};

export default DefaultTable;
